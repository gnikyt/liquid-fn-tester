/**
 * Tracks results of assertions.
 */
class Tracker {
  /**
   * Setup.
   */
  constructor() {
    this.data = {};
  }

  /**
   * Get successes.
   * @returns {Object}
   */
  get successes() {
    const success = this.toArray().filter(([, data]) => data.success);
    return Object.fromEntries([...success, ["total", success.length]]);
  }

  /**
   * Get failures.
   * @returns {Object}
   */
  get failures() {
    const failures = this.toArray().filter(([, data]) => !data.success);
    return Object.fromEntries([...failures, ["total", failures.length]]);
  }

  /**
   * Push a result to the tracking.
   * @param {string} desc Test description.
   * @param {any} param1.expected Expected result.
   * @param {any} param1.actual Actual result.
   * @param {any} param1.success If assertion was successful.
   * @returns {this}
   */
  push(desc, { expected, actual, success }) {
    if (this.has(desc)) {
      throw new Error(`"${desc}" already exists in tracking`);
    }

    this.data[desc] = { expected, actual, success };
    return this;
  }

  /**
   * Clear the tracker.
   * @returns {this}
   */
  clear() {
    this.data = [];
    return this;
  }

  /**
   * Check if tracker has test results.
   * @param {string} desc Test description.
   * @returns {boolean}
   */
  has(desc) {
    return this.data[desc] !== undefined;
  }

  /**
   * toArray implementation.
   * @returns {Array<Object>}
   */
  toArray() {
    return Object.entries(this.data);
  }
}

module.exports = Tracker;
