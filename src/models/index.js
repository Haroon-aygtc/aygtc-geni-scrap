/**
 * Models Index
 *
 * This file initializes all models and sets up relationships between them.
 * It also exports all models for use in services.
 */

import { getMySQLClient } from "@/services/mysqlClient.js";

// Import model initializers
import { initFollowUpQuestion } from "./FollowUpQuestion.js";
import { initFollowUpConfig } from "./FollowUpConfig.js";
import { initChatMessage } from "./ChatMessage.js";
import { initChatSession } from "./ChatSession.js";
import { initUser } from "./User.js";
import { initUserActivity } from "./UserActivity.js";
import { initWidgetConfig } from "./WidgetConfig.js";
import { initResponseTemplate } from "./ResponseTemplate.js";
import { initResponseFormattingConfig } from "./ResponseFormattingConfig.js";
import { initAIResponseCache } from "./AIResponseCache.js";
import { initAIInteractionLog } from "./AIInteractionLog.js";
import { initPredefinedQuestion } from "./PredefinedQuestion.js";
import { initPredefinedQuestionSet } from "./PredefinedQuestionSet.js";
import { initTopicBasedQuestion } from "./TopicBasedQuestion.js";
import { initTopicBasedQuestionSet } from "./TopicBasedQuestionSet.js";

// Initialize models and relationships
export const initModels = async () => {
  try {
    const sequelize = await getMySQLClient();

    // Initialize models
    const User = await initUser();
    const UserActivity = await initUserActivity();
    const ChatSession = await initChatSession();
    const ChatMessage = await initChatMessage();
    const WidgetConfig = await initWidgetConfig();
    const FollowUpConfig = await initFollowUpConfig();
    const FollowUpQuestion = await initFollowUpQuestion();
    const ResponseTemplate = await initResponseTemplate();
    const ResponseFormattingConfig = await initResponseFormattingConfig();
    const AIResponseCache = await initAIResponseCache();
    const AIInteractionLog = await initAIInteractionLog();
    const PredefinedQuestion = await initPredefinedQuestion();
    const PredefinedQuestionSet = await initPredefinedQuestionSet();
    const TopicBasedQuestion = await initTopicBasedQuestion();
    const TopicBasedQuestionSet = await initTopicBasedQuestionSet();

    // Define relationships
    User.hasMany(UserActivity, { foreignKey: "user_id" });
    UserActivity.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(ChatSession, { foreignKey: "user_id" });
    ChatSession.belongsTo(User, { foreignKey: "user_id" });

    ChatSession.hasMany(ChatMessage, { foreignKey: "session_id" });
    ChatMessage.belongsTo(ChatSession, { foreignKey: "session_id" });

    User.hasMany(WidgetConfig, { foreignKey: "user_id" });
    WidgetConfig.belongsTo(User, { foreignKey: "user_id" });

    FollowUpConfig.hasMany(FollowUpQuestion, { foreignKey: "config_id" });
    FollowUpQuestion.belongsTo(FollowUpConfig, { foreignKey: "config_id" });

    PredefinedQuestionSet.hasMany(PredefinedQuestion, { foreignKey: "set_id" });
    PredefinedQuestion.belongsTo(PredefinedQuestionSet, {
      foreignKey: "set_id",
    });

    TopicBasedQuestionSet.hasMany(TopicBasedQuestion, { foreignKey: "set_id" });
    TopicBasedQuestion.belongsTo(TopicBasedQuestionSet, {
      foreignKey: "set_id",
    });

    console.log("Models initialized successfully");

    return {
      User,
      UserActivity,
      ChatSession,
      ChatMessage,
      WidgetConfig,
      FollowUpConfig,
      FollowUpQuestion,
      ResponseTemplate,
      ResponseFormattingConfig,
      AIResponseCache,
      AIInteractionLog,
      PredefinedQuestion,
      PredefinedQuestionSet,
      TopicBasedQuestion,
      TopicBasedQuestionSet,
      sequelize,
    };
  } catch (error) {
    console.error("Error initializing models:", error);
    throw error;
  }
};

// Export models
export { default as User } from "./User.js";

export { default as UserActivity } from "./UserActivity.js";

export { default as ChatSession } from "./ChatSession.js";

export { default as ChatMessage } from "./ChatMessage.js";

export { default as WidgetConfig } from "./WidgetConfig.js";

export { default as FollowUpConfig } from "./FollowUpConfig.js";

export { default as FollowUpQuestion } from "./FollowUpQuestion.js";

export { default as ResponseTemplate } from "./ResponseTemplate.js";

export { default as ResponseFormattingConfig } from "./ResponseFormattingConfig.js";

export { default as AIResponseCache } from "./AIResponseCache.js";

export { default as AIInteractionLog } from "./AIInteractionLog.js";

export { default as PredefinedQuestion } from "./PredefinedQuestion.js";

export { default as PredefinedQuestionSet } from "./PredefinedQuestionSet.js";

export { default as TopicBasedQuestion } from "./TopicBasedQuestion.js";

export { default as TopicBasedQuestionSet } from "./TopicBasedQuestionSet.js";
