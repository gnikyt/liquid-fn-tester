const BasePresenter = require("./presenter");
const textfmt = require("../../utils/text-fmt");

/**
 * Default presenter.
 */
class Default extends BasePresenter {
  /**
   * @inheritdoc
   */
  toString() {
    const passed = textfmt.color(textfmt.CONGREEN, " Passed ");
    const errored = textfmt.color(textfmt.CONRED, " Error ");
    const opassed = textfmt.color(textfmt.CONGREEN, " Total Passed ");
    const oerrored = textfmt.color(textfmt.CONRED, " Total Failed ");
    const ooverall = textfmt.color(textfmt.CUBLACK, "Overall");

    let str = "";
    for (const [desc, data] of this.tracker.toArray()) {
      const { expected, actual, success } = data;
      str += [
        textfmt.color(textfmt.CUBLACK, `Test: ${desc}`),
        textfmt.color(textfmt.CONBLACK, " Expected "),
        expected,
        textfmt.color(textfmt.CONBLACK, " Actual "),
        actual,
        success ? passed : errored,
      ].join("\n");
      str += "\n\n";
    }

    if (this.opts.withOverall) {
      const { successes, failures } = this.tracker;
      str += [
        ooverall,
        `${opassed} ${successes.total}`,
        `${oerrored} ${failures.total}`,
      ].join("\n");
    }

    return str;
  }
}

module.exports = Default;
