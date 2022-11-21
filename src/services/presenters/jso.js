const BasePresenter = require("./presenter");

/**
 * JSON presenter.
 * Named JSO to prevent collison.
 */
class JSO extends BasePresenter {
  /**
   * @inheritdoc
   */
  toString() {
    const {
      data,
      successes: { total: sTotal },
      failures: { total: fTotal },
    } = this.tracker;
    const { withOverall, pretty } = this.opts;

    let dataFixed = data;
    if (withOverall) {
      dataFixed = {
        results: dataFixed,
        overall: {
          passed: sTotal,
          failures: fTotal,
        },
      };
    }

    return pretty
      ? JSON.stringify(dataFixed, null, pretty)
      : JSON.stringify(dataFixed);
  }
}

module.exports = JSO;
