const fetch = require("node-fetch");
const fs = require("fs/promises");
const path = require("path");
const nodeAssert = require("assert");
const { Event } = require("./constants");

/**
 * Base test, to be extended from.
 */
class BaseTest {
  /**
   * Setup.
   * @param {Assets} param0.assets Assets handler.
   * @param {Emitter} param0.emitter Event emitter.
   * @param {Tracker} param0.tracker Result tracker.
   * @param {string} param0.entry Entry name for test files.
   * @param {string} param0.shop Shopify shop URL.
   */
  constructor({ assets, emitter, tracker, entry, shop }) {
    // Setup entry name
    this.entry = entry;

    // Shop name
    this.shop = shop;

    // Asset handler
    this.assets = assets;

    // Event emitter
    this.emitter = emitter;

    // Result tracker
    this.tracker = tracker;
  }

  /**
   * Load setup and snippet file contents.
   * @returns Promise<string>
   */
  async loadLiquid() {
    // Filepath
    const fp = path.resolve("tests", `${this.entry}.liquid`);
    this.emitter.emit(Event.LiquidLoadStart, fp);

    try {
      // Load setup and snippet entry supplied
      const file = await fs.readFile(fp, "utf8");
      this.emitter.emit(Event.LiquidLoadEnd, fp);
      return file;
    } catch (e) {
      this.emitter.emit(Event.LiquidLoadFailure, e);
      throw e;
    }
  }

  /**
   * To be ran before tests.
   * @returns {Promise<Array<Object>>}
   */
  async setup() {
    // Get the test content
    this.emitter.emit(Event.SetupStart);
    const snippetLiquid = await this.loadLiquid(this.entry);

    // Setup event listeners to track assertions
    this.emitter.on(Event.AssertSuccess, ({ desc, expected, actual }) => {
      this.tracker.push(desc, { expected, actual, success: true });
    });
    this.emitter.on(Event.AssertFailure, ({ desc, expected, actual }) => {
      this.tracker.push(desc, { expected, actual, success: false });
    });

    try {
      // Create the test page, snippet, etc
      const results = await Promise.all([
        this.assets.createPage(),
        this.assets.createSnippet(snippetLiquid),
      ]);

      this.emitter.emit(Event.SetupEnd, results);
      return results;
    } catch (e) {
      this.emitter.emit(Event.SetupFailure, e);
      throw e;
    }
  }

  /**
   * To be ran after tests.
   * @returns {Promise<Object>}
   */
  async teardown() {
    this.emitter.emit(Event.TeardownStart);

    // Delete all created page templates
    try {
      const promises = [];
      this.assets.createdTemplates.forEach((suffix) => {
        promises.push(this.assets.deletePageTemplate(suffix));
      });

      const results = await Promise.all(promises);
      this.emitter.emit(Event.TeardownEnd, results);
    } catch (e) {
      this.emitter.emit(Event.TeardownFailure, e);
      throw e;
    }
  }

  /**
   * Call the page URL and get the result to test against.
   * @param {string} template Liquid template for page.
   * @param {number} param1.delay How long to delay for, sometimes cache issues, default: 1 second (1000ms).
   * @returns {Promise<string>}
   */
  async render(template, { delay } = { delay: 1000 }) {
    this.emitter.emit(Event.RenderStart, { template, delay });

    // Create page template
    let suffix;
    try {
      suffix = await this.assets.createPageTemplate(template);
      this.emitter.emit(Event.RenderSuffix, { template, suffix });
    } catch (e) {
      this.emitter.emit(Event.RenderFailure, e);
    }

    // Track if retried
    let retried = false;

    /**
     * Fetch the page.
     * @returns {Promise<string>}
     */
    const fetchPage = async () => {
      const url = `https://${this.shop}/pages/liquid-fn-test?view=liquid-fn-test-${suffix}`;
      const response = await fetch(url);
      return response.text();
    };

    /**
     * Process page result.
     * @param {string} text Response text.
     * @param {Function} resolve Resolver.
     */
    const processPage = async (text, resolve) => {
      const hasHtml = text.includes("<!doctype html>");
      if (hasHtml && !retried) {
        // Retry page call
        retried = true;
        this.emitter.emit(Event.RenderRetry);

        const textRetry = await fetchPage();
        processPage(textRetry, resolve);
      } else if (hasHtml && retried) {
        // Reached our max... something wrong on Shopify's side
        this.emitter.emit(Event.RenderRetryFailure);
        this.emitter.emit(Event.RenderEnd, "");
        resolve("Response returned unexpected HTML.");
      } else {
        // All good, no HTML
        this.emitter.emit(Event.RenderEnd, text);
        resolve(text);
      }
    };

    // Get result
    const promise = new Promise((resolve) => {
      setTimeout(async () => {
        const text = await fetchPage();
        processPage(text, resolve);
      }, delay);
    });
    return promise;
  }

  /**
   * Helper to assert values with outputs.
   * @param {string} desc Description of the test being performed.
   * @param {boolean} assertion Assertion test for truthy/falsey.
   * @param {any} expected Expected result.
   * @param {any} actual Actual result.
   * @returns {boolean}
   */
  async assert(desc, assertion, expected, actual) {
    this.emitter.emit(Event.AssertStart, { desc, assertion, expected, actual });

    try {
      // Assert
      nodeAssert(assertion);
      this.emitter.emit(Event.AssertSuccess, {
        desc,
        assertion,
        expected,
        actual,
      });
      return true;
    } catch (e) {
      // Error
      this.emitter.emit(Event.AssertFailure, {
        desc,
        assertion,
        expected,
        actual,
        error: e,
      });
      return false;
    }
  }
}

module.exports = BaseTest;
