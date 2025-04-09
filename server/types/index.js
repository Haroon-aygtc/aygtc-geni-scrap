/**
 * Types Index
 *
 * This file exports all type modules for easy access.
 */

const followUpTypes = require("./followUp");
const analyticsTypes = require("./analytics");

module.exports = {
  ...followUpTypes,
  ...analyticsTypes,
};
