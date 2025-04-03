import { v4 as uuidv4 } from "uuid";

interface ChatSession {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
}

// Mock data for development
const sessions: Record<string, ChatSession> = {};
const messages: Record<string, ChatMessage[]> = {};

export const chatService = {
  createSession: async (): Promise<ChatSession> => {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      userId: "anonymous", // In a real implementation, this would be the authenticated user's ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    sessions[sessionId] = session;
    messages[sessionId] = [];

    return session;
  },

  getSession: async (sessionId: string): Promise<ChatSession | null> => {
    return sessions[sessionId] || null;
  },

  getSessionMessages: async (sessionId: string): Promise<ChatMessage[]> => {
    return messages[sessionId] || [];
  },

  sendMessage: async (
    sessionId: string,
    content: string,
  ): Promise<ChatMessage> => {
    if (!sessions[sessionId]) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      content,
      role: "user",
      timestamp: new Date(),
    };

    if (!messages[sessionId]) {
      messages[sessionId] = [];
    }

    messages[sessionId].push(userMessage);

    // Simulate AI response
    const aiMessage: ChatMessage = {
      id: uuidv4(),
      sessionId,
      content: `This is a mock response to: "${content}". In a real implementation, this would be generated by an AI model.`,
      role: "assistant",
      timestamp: new Date(),
    };

    messages[sessionId].push(aiMessage);

    // Update session
    sessions[sessionId].updatedAt = new Date();

    return aiMessage;
  },
};
