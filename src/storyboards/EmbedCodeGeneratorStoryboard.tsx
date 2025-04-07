import React from "react";
import EmbedCodeGenerator from "@/components/admin/EmbedCodeGenerator";

export default function EmbedCodeGeneratorStoryboard() {
  return (
    <div className="bg-white min-h-screen p-6">
      <EmbedCodeGenerator
        widgetId="chat-widget-demo"
        widgetColor="#4f46e5"
        widgetPosition="bottom-right"
        widgetSize="medium"
        userId="demo-user-id"
      />
    </div>
  );
}
