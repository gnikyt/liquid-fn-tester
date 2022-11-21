/**
 * Base presenter for tracked results.
 */
class BasePresenter {
  /**
   * Setup.
   * @param {Tracker} tracker Result tracker.
   * @param {Object} opts Options.
   */
  constructor(tracker, opts = {}) {
    this.tracker = tracker;
    this.opts = {
      withOverall: true,
      ...opts,
    };
  }

  /**
   * All children must implement.
   * @returns {string}
   */
  // eslint-disable-next-line class-methods-use-this
  toString() {
    throw new Error("toString not implemented");
  }
}

module.exports = BasePresenter;
