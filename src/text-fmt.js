// Colors
const CRED = "\x1b[0;31m";
const CBLUE = "\x1b[0;34m";
const CYELLOW = "\x1b[0;33m";
const CGREEN = "\x1b[0;32m";
const CONGREEN = "\x1b[42m";
const CONRED = "\x1b[41m";
const CONBLACK = "\x1b[40m";
const CUBLACK = "\x1b[4;29m";
const CBBLACK = "\x1b[1m";
const CRESET = "\x1b[0m";

/**
 * Colored text support.
 * @param {string} clr Color to use.
 * @param {string} msg Message to display.
 * @returns {string}
 */
function color(clr, msg) {
  return `${clr}${msg}${CRESET}`;
}

/**
 * Colored text support for errors.
 * @param {string} msg Message to display.
 * @returns {string}
 */
function error(msg) {
  const colorErr = color(CONRED, " ERR ");
  const colorLine = color(CRED, msg);
  return `${colorErr} ${colorLine}`;
}

module.exports = {
  color,
  error,
  CRED,
  CBLUE,
  CYELLOW,
  CGREEN,
  CONGREEN,
  CONRED,
  CONBLACK,
  CUBLACK,
  CBBLACK,
  CRESET,
};
