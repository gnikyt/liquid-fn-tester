const { Shopify } = require("@shopify/shopify-api");
const path = require("path");
const Assets = require("./src/assets");
const Emitter = require("./src/emitter");
const textfmt = require("./src/text-fmt");

/**
 * Main run.
 * @returns {Promise<void>}
 */
async function main() {
  // Get arguments we need
  const [shop, token, themeId, entry] = process.argv.shift().shift();
  if (!shop || !token || !themeId || !entry) {
    // Something is missing
    console.error(
      textfmt.error("Missing shop, token, theme ID, or entry parameter."),
    );
    process.exit(1);
  }

  // Setup Shopify API
  const api = new Shopify.Clients.Rest(shop, token);

  // Event emitter
  const emitter = new Emitter();

  // Setup asset handler
  const assets = new Assets(themeId, api);

  // Get the test file and init it
  // eslint-disable-next-line global-require
  const TestFile = require(path.resolve("tests", `${entry}.js`));
  const test = new TestFile({
    assets,
    emitter,
    shop,
    entry,
  });

  /**
   * Test setup.
   * @returns {Promise<void>}
   */
  const setup = async () => {
    try {
      await test.setup();
    } catch (e) {
      console.error(textfmt.error(`Unable to setup test: ${e.message}`));
      process.exit(1);
    }
  };

  /**
   * Test teardown.
   * @returns {Promise<void>}
   */
  const teardown = async () => {
    try {
      await test.teardown();
    } catch (e) {
      console.error(textfmt.error(`Unable to teardown test: ${e.message}`));
      process.exit(1);
    }
  };

  /**
   * Test run.
   * @returns {Promise<boolean|Error>}
   */
  const run = async () => {
    try {
      await test.run();
      return true;
    } catch (e) {
      await teardown();
      console.error(textfmt.error("Failed"));
      return e;
    }
  };

  // Setup, run, teardown
  await setup();
  const result = await run();
  if (!(result instanceof Error)) {
    await teardown();
  }
}

main();
