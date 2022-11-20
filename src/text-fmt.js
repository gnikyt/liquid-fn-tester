// Colors
const CRED = "033[0;31m";
const CBLUE = "033[0;34m";
const CYELLOW = "033[0;33m";
const CGREEN = "033[0;32m";
const CONGREEN = "033[42m";
const CONRED = "033[41m";
const CONBLACK = "033[40m";
const CUBLACK = "033[4;29m";
const CBBLACK = "033[1m";
const CRESET = "033[0m";

/**
 * Colored text support.
 * @param {string} clr Color to use.
 * @param {string} msg Message to display.
 * @returns {string}
 */
function color(clr, msg) {
  return `\${clr}${msg}\${CRESET}`;
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
