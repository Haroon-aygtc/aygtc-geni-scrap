import React from "react";
import ChatWidget from "@/components/chat/ChatWidget";

export default function ChatWidgetGuestStoryboard() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="w-[380px] h-[600px] border rounded-lg shadow-lg overflow-hidden">
        <ChatWidget
          previewMode={true}
          config={{
            primaryColor: "#4f46e5",
            titleText: "Chat Support",
            subtitleText: "We typically reply within a few minutes",
            initialMessage: "Hello! How can I help you today?",
            placeholderText: "Type your message here...",
            showBranding: true,
            allowAttachments: false,
            allowFeedback: true,
          }}
        />
      </div>
    </div>
  );
}
