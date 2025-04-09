import React, { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import GuestUserForm from "./GuestUserForm";
import { Button } from "@/components/ui/button";
import { MessageSquare, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/context/AuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import guestUserService from "@/services/guestUserService";

interface ChatWidgetProps {
  config?: any;
  previewMode?: boolean;
  widgetId?: string;
  onClose?: () => void;
  embedded?: boolean;
}

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  timestamp: Date;
  status?: "sending" | "sent" | "error";
}

interface GuestUser {
  id: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  sessionToken?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  config,
  previewMode = false,
  widgetId,
  onClose,
  embedded = false,
}) => {
  const [isOpen, setIsOpen] = useState(previewMode || false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [guestUser, setGuestUser] = useState<GuestUser | null>(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [isGuestFormLoading, setIsGuestFormLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { connected, lastMessage, sendMessage } = useWebSocket();

  // Default configuration
  const defaultConfig = {
    primaryColor: "#4f46e5",
    secondaryColor: "#f3f4f6",
    fontFamily: "Inter",
    borderRadius: 8,
    position: "bottom-right",
    initialMessage: "Hello! How can I help you today?",
    placeholderText: "Type your message here...",
    titleText: "Chat Support",
    subtitleText: "We typically reply within a few minutes",
    showBranding: true,
    allowAttachments: false,
    allowFeedback: true,
  };

  // Merge provided config with defaults
  const widgetConfig = { ...defaultConfig, ...config };

  // Load widget configuration if widgetId is provided
  useEffect(() => {
    if (widgetId && !previewMode) {
      loadWidgetConfig();
    }
  }, [widgetId]);

  const loadWidgetConfig = async () => {
    try {
      // Load widget configuration from the server (public endpoint)
      const response = await fetch(`/api/public/widget/${widgetId}/config`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Update the widget configuration with the fetched data
          const fetchedConfig = data.data;
          const mergedConfig = { ...defaultConfig, ...fetchedConfig.settings };
          // Update the widget configuration
          Object.keys(mergedConfig).forEach((key) => {
            if (widgetConfig[key] !== undefined) {
              widgetConfig[key] = mergedConfig[key];
            }
          });
        }
      }
    } catch (error) {
      console.error("Error loading widget configuration:", error);
    }
  };

  // Check for existing guest session in localStorage
  useEffect(() => {
    if (isOpen && !previewMode) {
      const storedGuestSession = localStorage.getItem("guestSession");
      if (storedGuestSession) {
        try {
          const parsedSession = JSON.parse(storedGuestSession);
          if (parsedSession && parsedSession.sessionToken) {
            validateGuestSession(parsedSession.sessionToken);
          } else {
            setShowGuestForm(true);
          }
        } catch (error) {
          console.error("Error parsing stored guest session:", error);
          setShowGuestForm(true);
        }
      } else if (!user) {
        // No stored session and no authenticated user
        setShowGuestForm(true);
      } else {
        // User is authenticated, initialize chat session
        initChatSession();
      }
    } else if (isOpen && previewMode) {
      // In preview mode, just initialize the chat
      initChatSession();
    }
  }, [isOpen, user]);

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === "chat_message" && sessionId) {
      if (lastMessage.sessionId === sessionId) {
        // Add the message to the chat
        if (lastMessage.role === "assistant") {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: lastMessage.id || Date.now().toString(),
              content: lastMessage.content,
              role: lastMessage.role,
              timestamp: new Date(),
            },
          ]);
        }
      }
    }
  }, [lastMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Validate guest session token
  const validateGuestSession = async (sessionToken: string) => {
    try {
      const response =
        await guestUserService.getGuestUserBySession(sessionToken);

      if (response.success && response.data) {
        setGuestUser({
          ...response.data,
          sessionToken,
        });
        // Now that we have a valid guest user, initialize the chat
        initChatSession();
      } else {
        // Invalid or expired session
        localStorage.removeItem("guestSession");
        setShowGuestForm(true);
      }
    } catch (error) {
      console.error("Error validating guest session:", error);
      localStorage.removeItem("guestSession");
      setShowGuestForm(true);
    }
  };

  // Handle guest form submission
  const handleGuestFormSubmit = async (data: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  }) => {
    setIsGuestFormLoading(true);
    try {
      const response = await guestUserService.createGuestUser({
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        email: data.email,
      });

      if (response.success && response.data) {
        const { user, session } = response.data;

        // Store session in localStorage
        localStorage.setItem(
          "guestSession",
          JSON.stringify({
            guestId: user.id,
            sessionToken: session.sessionToken,
            expiresAt: session.expiresAt,
          }),
        );

        // Update state
        setGuestUser({
          id: user.id,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          email: user.email,
          sessionToken: session.sessionToken,
        });

        // Hide form and initialize chat
        setShowGuestForm(false);
        initChatSession();

        // Log activity
        await guestUserService.logGuestActivity(user.id, "chat_started", {
          widgetId,
        });
      } else {
        throw new Error(
          response.error?.message || "Failed to register guest user",
        );
      }
    } catch (error) {
      console.error("Error registering guest user:", error);
      toast({
        title: "Error",
        description: "Failed to register. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGuestFormLoading(false);
    }
  };

  const initChatSession = async () => {
    try {
      // Clear any existing messages
      setMessages([]);

      // In preview mode, just add the initial message
      if (previewMode) {
        setMessages([
          {
            id: "initial",
            content: widgetConfig.initialMessage,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      // Create or resume a chat session
      const session = await chatService.createSession();
      setSessionId(session.id);

      // Load previous messages if any
      const history = await chatService.getSessionMessages(session.id);
      if (history.length > 0) {
        setMessages(history);
      } else {
        // Send initial message
        sendMessage({
          type: "chat_message",
          sessionId: session.id,
          content: widgetConfig.initialMessage,
          role: "assistant",
        });

        setMessages([
          {
            id: "initial",
            content: widgetConfig.initialMessage,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
      }

      // Log activity if guest user
      if (guestUser) {
        await guestUserService.logGuestActivity(
          guestUser.id,
          "chat_session_created",
          { sessionId: session.id },
        );
      }
    } catch (error) {
      console.error("Error initializing chat session:", error);
      // Even if there's an error, show the initial message in preview mode
      if (previewMode) {
        setMessages([
          {
            id: "initial",
            content: widgetConfig.initialMessage,
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
      } else {
        toast({
          title: "Error",
          description: "Failed to initialize chat. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Create a new message object
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      status: "sending",
    };

    // Add the message to the UI immediately
    setMessages((prev) => [...prev, newMessage]);

    // In preview mode, simulate a response
    if (previewMode) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            content:
              "Thanks for your message! I'm here to help with any questions you might have about our products or services.",
            role: "assistant",
            timestamp: new Date(),
          },
        ]);
      }, 1500);
      return;
    }

    try {
      // Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "sent" } : msg,
        ),
      );

      // Show typing indicator
      setIsTyping(true);

      // Log activity if guest user
      if (guestUser) {
        await guestUserService.logGuestActivity(guestUser.id, "message_sent", {
          messageContent:
            content.substring(0, 100) + (content.length > 100 ? "..." : ""),
        });
      }

      // Send the message via WebSocket
      if (connected && sessionId) {
        sendMessage({
          type: "chat_message",
          sessionId,
          content,
          role: "user",
          guestId: guestUser?.id, // Include guest ID if available
        });
      } else {
        // Fallback to REST API if WebSocket is not connected
        // For public widget, use the public endpoint
        let response;
        if (embedded && widgetId) {
          // Use public endpoint for embedded widget
          const publicResponse = await fetch(
            `/api/public/widget/${widgetId}/chat`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: content,
                sessionId,
                guestId: guestUser?.id, // Include guest ID if available
              }),
            },
          );

          if (publicResponse.ok) {
            const data = await publicResponse.json();
            if (data.success) {
              response = data.data;
            }
          }
        } else {
          // Use authenticated endpoint for logged-in users
          response = await chatService.sendMessage(sessionId!, content);
        }

        if (response) {
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            {
              id: response.messageId || response.id,
              content: response.content,
              role: "assistant",
              timestamp: new Date(response.timestamp),
            },
          ]);

          // Log activity if guest user
          if (guestUser) {
            await guestUserService.logGuestActivity(
              guestUser.id,
              "received_response",
              { responseId: response.messageId || response.id },
            );
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Update message status to error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "error" } : msg,
        ),
      );
      setIsTyping(false);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Apply custom styles based on configuration
  const widgetStyle = {
    fontFamily: widgetConfig.fontFamily,
    "--primary-color": widgetConfig.primaryColor,
    "--secondary-color": widgetConfig.secondaryColor,
    "--border-radius": `${widgetConfig.borderRadius}px`,
  } as React.CSSProperties;

  // Position classes
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  }[widgetConfig.position];

  // If embedded, render the full widget without the toggle button
  if (embedded) {
    return (
      <div
        className="chat-widget-container h-full flex flex-col overflow-hidden rounded-lg border shadow-lg bg-white"
        style={widgetStyle}
      >
        <ChatHeader
          title={widgetConfig.titleText}
          subtitle={widgetConfig.subtitleText}
          logoUrl={widgetConfig.logoUrl}
          onClose={onClose}
          primaryColor={widgetConfig.primaryColor}
        />
        {showGuestForm ? (
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            <GuestUserForm
              onSubmit={handleGuestFormSubmit}
              isLoading={isGuestFormLoading}
            />
          </div>
        ) : (
          <>
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              allowFeedback={widgetConfig.allowFeedback}
              messagesEndRef={messagesEndRef}
            />
            <ChatInput
              onSendMessage={handleSendMessage}
              placeholder={widgetConfig.placeholderText}
              allowAttachments={widgetConfig.allowAttachments}
              primaryColor={widgetConfig.primaryColor}
            />
          </>
        )}
        {widgetConfig.showBranding && (
          <div className="text-center py-2 text-xs text-gray-500">
            Powered by ChatAdmin
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`chat-widget fixed ${positionClasses} z-50`}
      style={widgetStyle}
    >
      {isOpen ? (
        <div className="chat-widget-expanded flex flex-col w-80 h-[500px] rounded-lg border shadow-lg bg-white overflow-hidden">
          <ChatHeader
            title={widgetConfig.titleText}
            subtitle={widgetConfig.subtitleText}
            logoUrl={widgetConfig.logoUrl}
            onClose={toggleChat}
            primaryColor={widgetConfig.primaryColor}
          />
          {showGuestForm ? (
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              <GuestUserForm
                onSubmit={handleGuestFormSubmit}
                isLoading={isGuestFormLoading}
              />
            </div>
          ) : (
            <>
              <ChatMessages
                messages={messages}
                isTyping={isTyping}
                allowFeedback={widgetConfig.allowFeedback}
                messagesEndRef={messagesEndRef}
              />
              <ChatInput
                onSendMessage={handleSendMessage}
                placeholder={widgetConfig.placeholderText}
                allowAttachments={widgetConfig.allowAttachments}
                primaryColor={widgetConfig.primaryColor}
              />
            </>
          )}
          {widgetConfig.showBranding && (
            <div className="text-center py-2 text-xs text-gray-500">
              Powered by ChatAdmin
            </div>
          )}
        </div>
      ) : (
        <Button
          onClick={toggleChat}
          className="chat-widget-button h-14 w-14 rounded-full shadow-lg flex items-center justify-center"
          style={{ backgroundColor: widgetConfig.primaryColor }}
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  );
};

export default ChatWidget;
