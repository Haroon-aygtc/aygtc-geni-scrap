import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ChatWidget from "@/components/chat/ChatWidget";

/**
 * Chat Embed Page
 *
 * This page is used for embedding the chat widget in an iframe.
 * It reads configuration from URL parameters and passes them to the ChatWidget component.
 */
const ChatEmbedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Extract configuration from URL parameters
    const widgetId = searchParams.get("widgetId") || undefined;
    const position = (searchParams.get("position") as any) || "bottom-right";
    const color = searchParams.get("color") || "#4f46e5";
    const size = (searchParams.get("size") as any) || "medium";
    const contextMode = (searchParams.get("contextMode") as any) || "general";
    const contextRuleId = searchParams.get("contextRuleId") || undefined;

    // Set configuration
    setConfig({
      primaryColor: color,
      position,
      widgetSize: size,
      contextMode,
      contextRuleId,
    });
  }, [searchParams]);

  if (!config) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      <ChatWidget
        config={config}
        widgetId={searchParams.get("widgetId") || undefined}
        embedded={true}
        previewMode={false}
      />
    </div>
  );
};

export default ChatEmbedPage;
