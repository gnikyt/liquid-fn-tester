const { Shopify } = require("@shopify/shopify-api");
const path = require("path");
const Assets = require("./src/assets");
const Emitter = require("./src/emitter");
const textfmt = require("./src/text-fmt");

// Usage message
const usageMsg = `
  \tDocker:
  \t> docker run -it -v .:/app:z liquid_fn node index.js (store) (token) (theme_id) (test_name)

  \tNode:
  \t> node index.js (store) (token) (theme_id) (test_name)
`;

/**
 * Exit process and display message.
 * @param {string} msg Message to display on console.
 * @returns {void}
 */
function exit(msg) {
  console.error(textfmt.error(msg));
  process.exit(1);
}

/**
 * Main run.
 * @returns {Promise<void>}
 */
async function main() {
  // Get arguments we need
  const [shop, token, themeId, entry] = process.argv.slice(2);
  if (!shop || !token || !themeId || !entry) {
    // Something is missing
    exit(
      `Missing shop, token, theme ID, or entry parameter.\nUsage:${usageMsg}`,
    );
  }

  // Setup Shopify API
  const api = new Shopify.Clients.Rest(shop, token);

  // Event emitter
  const emitter = new Emitter();

  // Setup asset handler
  const assets = new Assets(themeId, api);

  // Get the test file and init it
  let TestFile;
  try {
    // eslint-disable-next-line global-require
    TestFile = require(path.resolve("tests", `${entry}.js`));
  } catch (e) {
    exit(`Unable to load test suite: ${e.message}`);
  }

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
      exit(`Unable to setup test: ${e.message}`);
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
      exit(`Unable to teardown test: ${e.message}`);
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
