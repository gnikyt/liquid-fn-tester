const { Shopify } = require("@shopify/shopify-api");
const path = require("path");
const Assets = require("./src/services/assets");
const Emitter = require("./src/services/emitter");
const Tracker = require("./src/services/tracker");
const { Console, JSO } = require("./src/services/presenters");
const textfmt = require("./src/utils/text-fmt");

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
 * Setup and returns dependencies for test.
 * @param {string} param0.shop Shopify shop domain.
 * @param {string} param0.token Shopify API token.
 * @param {string} param0.themeId Shopify theme ID.
 * @returns {Object}
 */
function setupDeps({ shop, token, themeId }) {
  // Event emitter
  const emitter = new Emitter();

  // Tracker for results
  const tracker = new Tracker();

  // Setup Shopify API
  const api = new Shopify.Clients.Rest(shop, token);

  // Setup asset handler
  const assets = new Assets(themeId, api);

  return {
    api,
    emitter,
    assets,
    tracker,
  };
}

/**
 * Load and setup the test suite with dependencies.
 * @param {Object} deps Test suite dependencies to pass into constructor.
 * @returns {Object}
 */
function setupTest(deps) {
  // Load the test suite file
  let TestFile;
  try {
    // eslint-disable-next-line global-require
    TestFile = require(path.resolve("tests", `${deps.entry}.js`));
  } catch (e) {
    exit(`Unable to load test suite: ${e.message}`);
  }

  // Init the test suite
  const test = new TestFile(deps);
  return test;
}

/**
 * Test setup.
 * @param {Object} test Test suite.
 * @returns {Promise<void>}
 */
async function setup(test) {
  try {
    await test.setup();
  } catch (e) {
    exit(`Unable to setup test: ${e.message}`);
  }
}

/**
 * Test teardown.
 * @param {Object} test Test suite.
 * @returns {Promise<void>}
 */
async function teardown(test) {
  try {
    await test.teardown();
  } catch (e) {
    exit(`Unable to teardown test: ${e.message}`);
  }
}

/**
 * Test run.
 * @param {Object} test Test suite.
 * @returns {Promise<boolean|Error>}
 */
async function run(test) {
  try {
    await test.run();
    return true;
  } catch (e) {
    await teardown(test);
    return e;
  }
}

/**
 * Use a presenter to format the tracking data for output.
 * @param {Object} presenter Presentation handler.
 * @param {Object} tracker Results tracker.
 * @returns {string}
 */
function present(presenter, tracker) {
  // Output presentation
  let handler;
  switch (presenter) {
    case "jso":
    case "json":
      handler = new JSO(tracker);
      break;
    case "jso-pretty":
    case "json-pretty":
      handler = new JSO(tracker, { pretty: 2 });
      break;
    case "console":
    default:
      handler = new Console(tracker);
      break;
  }

  return handler.toString();
}

/**
 * Main run.
 * @returns {Promise<void>}
 */
async function main() {
  // Get arguments we need
  const [shop, token, themeId, entry, presenter] = process.argv.slice(2);
  if (!shop || !token || !themeId || !entry) {
    // Something is missing
    exit(
      `Missing shop, token, theme ID, or entry parameter.\nUsage:${usageMsg}`,
    );
  }

  // Setup dependencies for test
  const deps = setupDeps({ shop, token, themeId });

  // Init the test suite
  const test = setupTest({ shop, entry, ...deps });

  // Setup, run, teardown
  await setup(test);
  const result = await run(test);
  if (!(result instanceof Error)) {
    await teardown(test);
  }

  // Output
  console.log(present(presenter, test.tracker));
}

main();
