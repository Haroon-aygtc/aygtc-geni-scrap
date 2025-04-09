/**
 * Chat Widget Web Component
 *
 * This script creates a custom element that can be embedded on any website
 * to provide chat functionality using Shadow DOM for style encapsulation.
 */

(function () {
  // Define the chat widget custom element
  class ChatWidget extends HTMLElement {
    constructor() {
      super();
      // Create a shadow root
      this.attachShadow({ mode: "open" });

      // Get attributes or use defaults
      this.widgetId = this.getAttribute("widget-id") || "default-widget";
      this.position = this.getAttribute("position") || "bottom-right";
      this.color = this.getAttribute("color") || "#4f46e5";
      this.size = this.getAttribute("size") || "medium";
      this.contextMode = this.getAttribute("context-mode") || "general";
      this.contextRuleId = this.getAttribute("context-rule-id") || "";

      // State
      this.isOpen = false;
      this.messages = [];
      this.sessionId = null;
      this.isTyping = false;

      // Initialize the widget
      this.init();
    }

    init() {
      // Create the widget HTML structure
      this.render();

      // Add event listeners
      this.addEventListeners();

      // Load configuration from server
      this.loadConfig();
    }

    render() {
      // Define styles with CSS variables for customization
      const styles = `
        :host {
          --primary-color: ${this.color};
          --text-color: #333;
          --bg-color: white;
          --border-radius: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        }
        
        .chat-widget {
          position: fixed;
          ${this.position.includes("bottom") ? "bottom: 20px;" : "top: 20px;"}
          ${this.position.includes("right") ? "right: 20px;" : "left: 20px;"}
          z-index: 9999;
        }
        
        .chat-button {
          width: ${this.size === "small" ? "40px" : this.size === "medium" ? "50px" : "60px"};
          height: ${this.size === "small" ? "40px" : this.size === "medium" ? "50px" : "60px"};
          border-radius: 50%;
          background-color: var(--primary-color);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: transform 0.2s;
        }
        
        .chat-button:hover {
          transform: scale(1.05);
        }
        
        .chat-icon {
          width: 24px;
          height: 24px;
        }
        
        .chat-window {
          display: ${this.isOpen ? "flex" : "none"};
          flex-direction: column;
          position: fixed;
          ${this.position.includes("bottom") ? "bottom: 80px;" : "top: 80px;"}
          ${this.position.includes("right") ? "right: 20px;" : "left: 20px;"}
          width: ${this.size === "small" ? "300px" : this.size === "medium" ? "350px" : "400px"};
          height: 500px;
          background-color: var(--bg-color);
          border-radius: var(--border-radius);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        
        .chat-header {
          background-color: var(--primary-color);
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .chat-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .chat-subtitle {
          margin: 0;
          font-size: 12px;
          opacity: 0.8;
        }
        
        .close-button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 20px;
        }
        
        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .message {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          word-break: break-word;
        }
        
        .user-message {
          align-self: flex-end;
          background-color: var(--primary-color);
          color: white;
          border-bottom-right-radius: 4px;
        }
        
        .assistant-message {
          align-self: flex-start;
          background-color: #f1f1f1;
          color: var(--text-color);
          border-bottom-left-radius: 4px;
        }
        
        .typing-indicator {
          display: flex;
          padding: 10px 14px;
          background-color: #f1f1f1;
          border-radius: 18px;
          align-self: flex-start;
          width: 60px;
        }
        
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #888;
          border-radius: 50%;
          margin: 0 2px;
          animation: typing-animation 1.4s infinite ease-in-out;
        }
        
        .typing-dot:nth-child(1) { animation-delay: 0s; }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        
        @keyframes typing-animation {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        
        .chat-input-container {
          display: flex;
          padding: 12px;
          border-top: 1px solid #eee;
        }
        
        .chat-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 20px;
          outline: none;
          font-size: 14px;
        }
        
        .send-button {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-left: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .branding {
          text-align: center;
          padding: 6px;
          font-size: 11px;
          color: #888;
          border-top: 1px solid #eee;
        }
      `;

      // Chat message icon SVG
      const chatIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      `;

      // Send icon SVG
      const sendIconSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      `;

      // Create the HTML structure
      this.shadowRoot.innerHTML = `
        <style>${styles}</style>
        <div class="chat-widget">
          <div class="chat-button">
            <div class="chat-icon">${chatIconSvg}</div>
          </div>
          
          <div class="chat-window">
            <div class="chat-header">
              <div>
                <h3 class="chat-title">Chat Support</h3>
                <p class="chat-subtitle">We typically reply within a few minutes</p>
              </div>
              <button class="close-button">&times;</button>
            </div>
            
            <div class="chat-messages">
              <!-- Messages will be added here dynamically -->
            </div>
            
            <div class="chat-input-container">
              <input type="text" class="chat-input" placeholder="Type your message here...">
              <button class="send-button">${sendIconSvg}</button>
            </div>
            
            <div class="branding">
              Powered by ChatAdmin
            </div>
          </div>
        </div>
      `;
    }

    addEventListeners() {
      // Get elements
      const chatButton = this.shadowRoot.querySelector(".chat-button");
      const closeButton = this.shadowRoot.querySelector(".close-button");
      const sendButton = this.shadowRoot.querySelector(".send-button");
      const chatInput = this.shadowRoot.querySelector(".chat-input");

      // Toggle chat window
      chatButton.addEventListener("click", () => {
        this.isOpen = true;
        this.updateChatWindow();
        if (this.messages.length === 0) {
          this.initChat();
        }
      });

      // Close chat window
      closeButton.addEventListener("click", () => {
        this.isOpen = false;
        this.updateChatWindow();
      });

      // Send message on button click
      sendButton.addEventListener("click", () => {
        this.sendMessage();
      });

      // Send message on Enter key
      chatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          this.sendMessage();
        }
      });
    }

    updateChatWindow() {
      const chatWindow = this.shadowRoot.querySelector(".chat-window");
      chatWindow.style.display = this.isOpen ? "flex" : "none";
    }

    async loadConfig() {
      try {
        // Get the base URL from the script src
        const scriptSrc = document.querySelector(
          'script[src*="chat-widget.js"]',
        ).src;
        const baseUrl = new URL(scriptSrc).origin;

        // Fetch widget configuration
        const response = await fetch(
          `${baseUrl}/api/public/widget/${this.widgetId}/config`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Update widget with configuration
            const config = data.data;

            // Update title and subtitle
            if (config.settings) {
              const settings = config.settings;
              if (settings.titleText) {
                this.shadowRoot.querySelector(".chat-title").textContent =
                  settings.titleText;
              }
              if (settings.subtitleText) {
                this.shadowRoot.querySelector(".chat-subtitle").textContent =
                  settings.subtitleText;
              }
              if (settings.placeholderText) {
                this.shadowRoot.querySelector(".chat-input").placeholder =
                  settings.placeholderText;
              }
              if (settings.primaryColor) {
                this.color = settings.primaryColor;
                this.updateStyles();
              }
              if (settings.showBranding !== undefined) {
                this.shadowRoot.querySelector(".branding").style.display =
                  settings.showBranding ? "block" : "none";
              }
            }

            // Update context rule if specified
            if (config.contextRuleId) {
              this.contextRuleId = config.contextRuleId;
            }
          }
        }
      } catch (error) {
        console.error("Error loading widget configuration:", error);
      }
    }

    updateStyles() {
      // Update CSS variables
      const root = this.shadowRoot.host;
      root.style.setProperty("--primary-color", this.color);
    }

    async initChat() {
      try {
        // Get the base URL from the script src
        const scriptSrc = document.querySelector(
          'script[src*="chat-widget.js"]',
        ).src;
        const baseUrl = new URL(scriptSrc).origin;

        // Add initial message
        this.addMessage({
          id: "initial",
          content: "Hello! How can I help you today?",
          role: "assistant",
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error initializing chat:", error);
      }
    }

    async sendMessage() {
      const chatInput = this.shadowRoot.querySelector(".chat-input");
      const content = chatInput.value.trim();

      if (!content) return;

      // Clear input
      chatInput.value = "";

      // Add user message to UI
      const userMessage = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
      };
      this.addMessage(userMessage);

      // Show typing indicator
      this.isTyping = true;
      this.updateTypingIndicator();

      try {
        // Get the base URL from the script src
        const scriptSrc = document.querySelector(
          'script[src*="chat-widget.js"]',
        ).src;
        const baseUrl = new URL(scriptSrc).origin;

        // Send message to server
        const response = await fetch(
          `${baseUrl}/api/public/widget/${this.widgetId}/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: content,
              sessionId: this.sessionId,
              contextRuleId: this.contextRuleId,
              contextMode: this.contextMode,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Save session ID for future messages
            if (data.data.sessionId) {
              this.sessionId = data.data.sessionId;
            }

            // Hide typing indicator
            this.isTyping = false;
            this.updateTypingIndicator();

            // Add assistant message
            this.addMessage({
              id: data.data.messageId,
              content: data.data.content,
              role: "assistant",
              timestamp: new Date(data.data.timestamp),
            });
          }
        } else {
          throw new Error("Failed to send message");
        }
      } catch (error) {
        console.error("Error sending message:", error);

        // Hide typing indicator
        this.isTyping = false;
        this.updateTypingIndicator();

        // Add error message
        this.addMessage({
          id: "error",
          content:
            "Sorry, there was an error sending your message. Please try again.",
          role: "assistant",
          timestamp: new Date(),
        });
      }
    }

    addMessage(message) {
      // Add message to state
      this.messages.push(message);

      // Add message to UI
      const messagesContainer = this.shadowRoot.querySelector(".chat-messages");
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.classList.add(
        message.role === "user" ? "user-message" : "assistant-message",
      );
      messageElement.textContent = message.content;
      messagesContainer.appendChild(messageElement);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateTypingIndicator() {
      const messagesContainer = this.shadowRoot.querySelector(".chat-messages");
      let typingIndicator = this.shadowRoot.querySelector(".typing-indicator");

      if (this.isTyping) {
        // Create typing indicator if it doesn't exist
        if (!typingIndicator) {
          typingIndicator = document.createElement("div");
          typingIndicator.classList.add("typing-indicator");
          typingIndicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
          `;
          messagesContainer.appendChild(typingIndicator);
        }

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      } else if (typingIndicator) {
        // Remove typing indicator
        typingIndicator.remove();
      }
    }
  }

  // Register the custom element
  customElements.define("chat-widget", ChatWidget);
})();
