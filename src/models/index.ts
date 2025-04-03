// Model interfaces for use throughout the application
// These are simplified versions of the database models

// Import model classes
import User, { initUser } from "./User";
import UserActivity, { initUserActivity } from "./UserActivity";
import ChatSession, { initChatSession } from "./ChatSession";
import ChatMessage, { initChatMessage } from "./ChatMessage";
import WidgetConfig, { initWidgetConfig } from "./WidgetConfig";
import AIResponseCache, { initAIResponseCache } from "./AIResponseCache";
import FollowUpConfig, { initFollowUpConfig } from "./FollowUpConfig";
import PredefinedQuestionSet, {
  initPredefinedQuestionSet,
} from "./PredefinedQuestionSet";
import PredefinedQuestion, {
  initPredefinedQuestion,
} from "./PredefinedQuestion";
import TopicBasedQuestionSet, {
  initTopicBasedQuestionSet,
} from "./TopicBasedQuestionSet";
import TopicBasedQuestion, {
  initTopicBasedQuestion,
} from "./TopicBasedQuestion";
import ResponseFormattingConfig, {
  initResponseFormattingConfig,
} from "./ResponseFormattingConfig";
import ResponseTemplate, { initResponseTemplate } from "./ResponseTemplate";
import FollowUpQuestion, { initFollowUpQuestion } from "./FollowUpQuestion";

// Initialize all models
export const initializeModels = async () => {
  try {
    // Initialize models
    await Promise.all([
      initUser(),
      initUserActivity(),
      initChatSession(),
      initChatMessage(),
      initWidgetConfig(),
      initAIResponseCache(),
      initFollowUpConfig(),
      initPredefinedQuestionSet(),
      initPredefinedQuestion(),
      initTopicBasedQuestionSet(),
      initTopicBasedQuestion(),
      initResponseFormattingConfig(),
      initResponseTemplate(),
      initFollowUpQuestion(),
    ]);

    // Define associations
    User.hasMany(UserActivity, { foreignKey: "user_id" });
    UserActivity.belongsTo(User, { foreignKey: "user_id" });

    User.hasMany(ChatSession, { foreignKey: "user_id" });
    ChatSession.belongsTo(User, { foreignKey: "user_id" });

    ChatSession.hasMany(ChatMessage, {
      foreignKey: "session_id",
      sourceKey: "session_id",
    });
    ChatMessage.belongsTo(ChatSession, {
      foreignKey: "session_id",
      targetKey: "session_id",
    });

    // Follow-up questions associations
    User.hasMany(FollowUpConfig, { foreignKey: "user_id" });
    FollowUpConfig.belongsTo(User, { foreignKey: "user_id" });

    FollowUpConfig.hasMany(PredefinedQuestionSet, { foreignKey: "config_id" });
    PredefinedQuestionSet.belongsTo(FollowUpConfig, {
      foreignKey: "config_id",
    });

    PredefinedQuestionSet.hasMany(PredefinedQuestion, { foreignKey: "set_id" });
    PredefinedQuestion.belongsTo(PredefinedQuestionSet, {
      foreignKey: "set_id",
    });

    FollowUpConfig.hasMany(TopicBasedQuestionSet, { foreignKey: "config_id" });
    TopicBasedQuestionSet.belongsTo(FollowUpConfig, {
      foreignKey: "config_id",
    });

    TopicBasedQuestionSet.hasMany(TopicBasedQuestion, { foreignKey: "set_id" });
    TopicBasedQuestion.belongsTo(TopicBasedQuestionSet, {
      foreignKey: "set_id",
    });

    // Add FollowUpQuestion associations
    FollowUpConfig.hasMany(FollowUpQuestion, { foreignKey: "config_id" });
    FollowUpQuestion.belongsTo(FollowUpConfig, { foreignKey: "config_id" });

    // Response formatting associations
    User.hasMany(ResponseFormattingConfig, { foreignKey: "user_id" });
    ResponseFormattingConfig.belongsTo(User, { foreignKey: "user_id" });

    ResponseFormattingConfig.hasMany(ResponseTemplate, {
      foreignKey: "config_id",
    });
    ResponseTemplate.belongsTo(ResponseFormattingConfig, {
      foreignKey: "config_id",
    });

    console.log("All models initialized successfully");
  } catch (error) {
    console.error("Error initializing models:", error);
    throw error;
  }
};

// Define interfaces for models
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  metadata?: any;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: any;
  created_at: Date;
}

export interface ContextRule {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  context_type: string;
  keywords?: string[];
  excluded_topics?: string[];
  prompt_template?: string;
  response_filters?: any[];
  use_knowledge_bases?: boolean;
  knowledge_base_ids?: string[];
  preferred_model?: string;
  version?: number;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  primary_color: string;
  position: string;
  initial_state: string;
  allow_attachments: boolean;
  allow_voice: boolean;
  allow_emoji: boolean;
  context_mode: string;
  context_rule_id?: string;
  welcome_message: string;
  placeholder_text: string;
  theme?: string;
  settings?: Record<string, any>;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface ChatSession {
  id: string;
  user_id?: string;
  widget_id?: string;
  status: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id?: string;
  content: string;
  type: string;
  metadata?: any;
  created_at: Date;
}

export interface AIResponseCache {
  id: string;
  prompt: string;
  prompt_hash: string;
  response: string;
  model_used: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
  expires_at: Date;
}

export interface AIInteractionLog {
  id: string;
  user_id: string;
  query: string;
  response: string;
  model_used: string;
  context_rule_id?: string;
  metadata?: any;
  created_at: Date;
}

export interface SystemSetting {
  id: string;
  category: string;
  environment: string;
  settings: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface FollowUpQuestionInterface {
  id: string;
  config_id: string;
  question: string;
  display_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Export model classes
export {
  User,
  UserActivity,
  ChatSession,
  ChatMessage,
  WidgetConfig,
  AIResponseCache,
  FollowUpConfig,
  PredefinedQuestionSet,
  PredefinedQuestion,
  TopicBasedQuestionSet,
  TopicBasedQuestion,
  ResponseFormattingConfig,
  ResponseTemplate,
  FollowUpQuestion,
};

// Export a default object with all models
const models = {
  User,
  UserActivity,
  ChatSession,
  ChatMessage,
  WidgetConfig,
  AIResponseCache,
  FollowUpConfig,
  PredefinedQuestionSet,
  PredefinedQuestion,
  TopicBasedQuestionSet,
  TopicBasedQuestion,
  ResponseFormattingConfig,
  ResponseTemplate,
  FollowUpQuestion,
  initializeModels,
};

export default models;
