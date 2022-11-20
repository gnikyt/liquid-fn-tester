const BaseTest = require("../src/base-test");

/**
 * Example test.
 */
class Example extends BaseTest {
  /**
   * Setup.
   * Overridden to post msg to console.
   */
  async setup() {
    super.setup();

    // Output assertions to console
    this.emitter.on("assert:success assert:failure", ({ msg }) =>
      console.log(msg.compiled),
    );
  }

  /**
   * Run tests.
   */
  async run() {
    // Tag to pass in and expected result
    const weights = [
      ["weight:1.30", "1.3"],
      ["weight:.3", "0.3"],
      ["weight:0.310", "0.31"],
    ];

    // Loop each and test results.
    // Each `this.render` call creates a new page template with the Liquid supplied.
    // Internally, it appends "{%- layout none -%}" to not render the layout.
    for (let i = 0, n = weights.length; i < n; i += 1) {
      const [tag, expected] = weights[i];

      // Create new page template, fetches the result.
      // Because the Liquid is ran inside Shopify, you can access anything
      // of the store, such as `all_products`, `request`, etc.
      const liquid = `{%- render 'example', value: "${tag}" -%}`;
      const result = await this.render(liquid);

      // Assertion...
      // - Test name to display
      // - Assertion logic
      // - Expected result
      // - Actual result
      this.assert(
        `Weight of ${tag.split(":")[1]}`,
        expected === result,
        expected,
        result,
      );
    }
  }
}

module.exports = Example;
