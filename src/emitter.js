/**
 * Event emitter.
 */
class Emitter {
  /**
   * Setup.
   */
  constructor() {
    /**
     * List of event listeners.
     * @type {Object}
     */
    this.spectators = {};
  }

  /**
   * Determine if something is a function.
   * @static
   * @param {any} itc The item to check.
   * @example
   * Emitter.isFunction("Hello") // returns false
   * Emitter.isFunction(Array.isArray) // returns true
   * @returns {boolean}
   */
  static isFunction(itc) {
    return typeof itc === "function";
  }

  /**
   * Determine if spectators are registered.
   * @returns {boolean}
   */
  get hasSpectators() {
    return this.spectators.length > 0;
  }

  /**
   * Registers an event listener.
   * @param {string} eventList List of events to listen for, space delimiter.
   * @param {Function} handler Handler to call when the event is emitted.
   * @example
   * // Multiple
   * emitter.on('start end', () => console.log('Fired!'));
   * // Single
   * emitter.on('end', resetHandler);
   * @returns {void}
   */
  on(eventList, handler) {
    if (!Emitter.isFunction(handler)) {
      throw new Error("Handler must be callable");
    }

    eventList.split(" ").forEach((event) => {
      if (!this.spectators[event]) {
        // Setup for event to accept handlers
        this.spectators[event] = [];
      }
      this.spectators[event].push(handler);
    });
  }

  /**
   * Removes an event listener.
   * @param {string} eventList List of events to remove listeners for, space delimiter.
   * @param {Function} handler Handler for the listener.
   * @example
   * emitter.off('reset', resetHandler);
   * @returns {void}
   */
  off(eventList, handler) {
    eventList.split(" ").forEach((event) => {
      if (handler === undefined) {
        // Remove all handlers for this event
        delete this.spectators[event];
      }

      this.spectators[event].forEach((evHandler, index) => {
        if (
          handler === evHandler ||
          (evHandler.originalHandler && evHandler.originalHandler === handler)
        ) {
          // Remove from listeners
          this.spectators[event].splice(index, 1);
        }
      });
    });
  }

  /**
   * Registers an event listener to run only once.
   * @param {string} eventList List of events to listen for, space delimiter.
   * @param {Function} handler Handler to call when the event is emitted.
   * @example
   * emitter.once('init', () => console.log('Fired once only!'));
   * @returns {void}
   */
  once(eventList, handler) {
    if (!Emitter.isFunction(handler)) {
      throw new Error("Handler must be callable");
    }

    // Cast to variable to use within newHandler
    const self = this;

    /**
     * Override the original handler so it can turn itself off.
     * @param {...any} args The arguments for the handler.
     * @returns {void}
     */
    function newHandler(...args) {
      // Register this event to remove itself
      self.off(eventList, newHandler);
      handler.apply(self, args);
    }
    newHandler.originalHandler = handler;

    // Register the listener
    this.on(eventList, newHandler);
  }

  /**
   * Emit event to the document.
   * @param {string} eventName Event name.
   * @param {Object} details Event details.
   * @example
   * emitter.emit('start', { timestamp });
   * @returns {void}
   */
  emit(eventName, details = {}) {
    if (!this.spectators[eventName]) {
      return;
    }

    this.spectators[eventName].forEach((handler) => {
      handler.apply(this, [details]);
    });
  }
}

module.exports = Emitter;
