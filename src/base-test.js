const fetch = require("node-fetch");
const fs = require("fs/promises");
const path = require("path");
const nodeAssert = require("assert");
const textfmt = require("./text-fmt");

/**
 * Base test, to be extended from.
 */
class BaseTest {
  /**
   * Setup.
   * @param {Assets} param0.assets Assets handler.
   * @param {Emitter} param0.emitter Event emitter.
   * @param {string} param0.entry Entry name for test files.
   * @param {string} param0.shop Shopify shop URL.
   */
  constructor({ assets, emitter, entry, shop }) {
    // Setup entry name
    this.entry = entry;

    // Shop name
    this.shop = shop;

    // Asset handler
    this.assets = assets;

    // Evetn emitter
    this.emitter = emitter;
  }

  /**
   * Load setup and snippet file contents.
   * @returns Promise<string>
   */
  async loadLiquid() {
    // Filepath
    const fp = path.resolve("tests", `${this.entry}.liquid`);
    this.emitter.emit("liquid-load:start", fp);

    try {
      // Load setup and snippet entry supplied
      const file = await fs.readFile(fp, "utf8");
      this.emitter.emit("liquid-load:end", fp);
      return file;
    } catch (e) {
      this.emitter.emit("liquid-load:failure", e);
      throw e;
    }
  }

  /**
   * To be ran before tests.
   * @returns {Promise<Array<Object>>}
   */
  async setup() {
    // Get the test content
    this.emitter.emit("setup:start");
    const snippetLiquid = await this.loadLiquid(this.entry);

    try {
      // Create the test page, snippet, etc
      const results = await Promise.all([
        this.assets.createPage(),
        this.assets.createSnippet(snippetLiquid),
      ]);

      this.emitter.emit("setup:end", results);
      return results;
    } catch (e) {
      this.emitter.emit("setup:failure", e);
      throw e;
    }
  }

  /**
   * To be ran after tests.
   * @returns {Promise<Object>}
   */
  async teardown() {
    this.emitter.emit("teardown:start");

    // Delete all created page templates
    try {
      const promises = [];
      this.assets.createdTemplates.forEach((suffix) => {
        promises.push(this.assets.deletePageTemplate(suffix));
      });

      const results = await Promise.all(promises);
      this.emitter.emit("teardown:end", results);
    } catch (e) {
      this.emitter.emit("teardown:failure", e);
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
    this.emitter.emit("render:start", { template, delay });

    // Create page template
    let suffix;
    try {
      suffix = await this.assets.createPageTemplate(template);
      this.emitter.emit("render:suffix", { template, suffix });
    } catch (e) {
      this.emitter.emit("render:failure", e);
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
        this.emitter.emit("render:retry");

        const textRetry = await fetchPage();
        processPage(textRetry, resolve);
      } else if (hasHtml && retried) {
        // Reached our max... something wrong on Shopify's side
        this.emitter.emit("render:retry:failure");
        this.emitter.emit("render:end", "");
        resolve("Response returned unexpected HTML.");
      } else {
        // All good, no HTML
        this.emitter.emit("render:end", text);
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
   * @returns {Object}
   */
  async assert(desc, assertion, expected, actual) {
    this.emitter.emit("assert:start", { desc, assertion, expected, actual });

    // Output messaging
    const msg = {
      stack: [
        textfmt.color(textfmt.CUBLACK, `Test: ${desc}`),
        textfmt.color(textfmt.CONBLACK, " Expected "),
        expected,
        textfmt.color(textfmt.CONBLACK, " Actual "),
        actual,
      ],
      get compiled() {
        return `${this.stack.join("\n")}\n`;
      },
    };

    // Result line to modify after assertion is complete
    const pass = textfmt.color(textfmt.CONGREEN, " Passed ");
    const error = textfmt.color(textfmt.CONRED, " Error ");

    try {
      // Assert
      nodeAssert(assertion);
      msg.stack.push(pass);
      this.emitter.emit("assert:success", {
        desc,
        assertion,
        expected,
        actual,
        msg,
      });
    } catch (e) {
      // Error
      msg.stack.push(error);
      this.emitter.emit("assert:failure", {
        desc,
        assertion,
        expected,
        actual,
        msg,
        error: e,
      });
    }
    return msg;
  }
}

module.exports = BaseTest;
