/**
 * Controllers Index
 *
 * This file exports all controllers for centralized imports.
 */

// Import controllers
import * as userController from "./userController.js";
import * as authController from "./authController.js";
import * as scrapingController from "./scrapingController.js";
import * as knowledgeBaseController from "./knowledgeBaseController.js";
import * as followUpConfigController from "./followUpConfigController.js";
import * as followUpQuestionController from "./followUpQuestionController.js";
import * as responseFormattingController from "./responseFormattingController.js";
import * as aiCacheController from "./aiCacheController.js";
import * as widgetController from "./widgetController.js";

// Export controllers
export {
  userController,
  authController,
  scrapingController,
  knowledgeBaseController,
  followUpConfigController,
  followUpQuestionController,
  responseFormattingController,
  aiCacheController,
  widgetController,
};
