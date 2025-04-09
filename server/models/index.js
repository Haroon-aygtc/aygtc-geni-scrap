/**
 * Models Index
 *
 * This file exports all model modules for easy access.
 */

const KnowledgeBase = require("./KnowledgeBase");
const GuestUser = require("./GuestUser");
const GuestSession = require("./GuestSession");
const GuestActivity = require("./GuestActivity");
const FollowUpQuestion = require("./FollowUpQuestion");
const FollowUpConfig = require("./FollowUpConfig");
const Analytics = require("./Analytics");

module.exports = {
  KnowledgeBase,
  GuestUser,
  GuestSession,
  GuestActivity,
  FollowUpQuestion,
  FollowUpConfig,
  Analytics,
};
