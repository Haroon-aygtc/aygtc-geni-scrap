import { useState, useEffect, useCallback, useRef } from "react";

type WebSocketMessage = {
  type: string;
  [key: string]: any;
};

interface WebSocketOptions {
  url?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectInterval?: number;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
  debug?: boolean;
}

export function useWebSocket(options: WebSocketOptions = {}) {
  const {
    url,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    onOpen,
    onClose,
    onError,
    onMessage,
    debug = false,
  } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Use refs for values that shouldn't trigger re-renders
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const log = useCallback(
    (message: string, ...args: any[]) => {
      if (debug) {
        console.log(`[WebSocket] ${message}`, ...args);
      }
    },
    [debug],
  );

  // Function to create a new WebSocket connection
  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      log("WebSocket already connected");
      return;
    }

    if (socketRef.current?.readyState === WebSocket.CONNECTING) {
      log("WebSocket already connecting");
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setConnecting(true);
    setError(null);

    // Use provided URL or default to current host with secure WebSocket
    const wsUrl = url || `wss://${window.location.host}/ws`;
    log(`Connecting to WebSocket at ${wsUrl}`);

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;
      setSocket(ws);

      ws.onopen = (event) => {
        log("WebSocket connected");
        setConnected(true);
        setConnecting(false);
        setReconnectAttempts(0);
        if (onOpen) onOpen(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          log("WebSocket message received", data);
          setLastMessage(data);
          if (onMessage) onMessage(data);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
          setError(new Error(`Failed to parse message: ${error.message}`));
        }
      };

      ws.onclose = (event) => {
        log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        setConnected(false);
        setConnecting(false);
        socketRef.current = null;

        if (onClose) onClose(event);

        // Attempt to reconnect if enabled and not a normal closure
        if (autoReconnect && event.code !== 1000) {
          attemptReconnect();
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError(new Error("WebSocket connection error"));
        setConnecting(false);
        if (onError) onError(event);
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setConnecting(false);
      if (autoReconnect) {
        attemptReconnect();
      }
    }
  }, [url, autoReconnect, onOpen, onClose, onError, onMessage, log]);

  // Function to attempt reconnection
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      log(`Maximum reconnect attempts (${maxReconnectAttempts}) reached`);
      setError(
        new Error(`Failed to reconnect after ${maxReconnectAttempts} attempts`),
      );
      return;
    }

    const nextAttempt = reconnectAttempts + 1;
    const delay = reconnectInterval * Math.pow(1.5, nextAttempt - 1); // Exponential backoff

    log(`Scheduling reconnect attempt ${nextAttempt} in ${delay}ms`);
    setReconnectAttempts(nextAttempt);

    reconnectTimeoutRef.current = window.setTimeout(() => {
      log(`Attempting to reconnect (${nextAttempt}/${maxReconnectAttempts})`);
      connect();
    }, delay);
  }, [
    reconnectAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    connect,
    log,
  ]);

  // Initialize WebSocket connection
  useEffect(() => {
    connect();

    // Clean up on unmount
    return () => {
      log("Cleaning up WebSocket connection");
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }

      if (socketRef.current) {
        // Use 1000 (Normal Closure) code to prevent reconnection attempts
        socketRef.current.close(1000, "Component unmounted");
        socketRef.current = null;
      }
    };
  }, [connect, log]);

  // Send message function
  const sendMessage = useCallback(
    (message: WebSocketMessage): boolean => {
      if (
        !socketRef.current ||
        socketRef.current.readyState !== WebSocket.OPEN
      ) {
        log("Cannot send message - WebSocket not connected");
        return false;
      }

      try {
        const messageString = JSON.stringify(message);
        socketRef.current.send(messageString);
        log("Message sent", message);
        return true;
      } catch (err) {
        console.error("Error sending WebSocket message:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
    },
    [log],
  );

  // Manual reconnect function
  const reconnect = useCallback(() => {
    log("Manual reconnection requested");
    if (socketRef.current) {
      socketRef.current.close(3001, "Manual reconnection");
      socketRef.current = null;
    }
    setReconnectAttempts(0);
    connect();
  }, [connect, log]);

  return {
    connected,
    connecting,
    reconnecting: connecting && reconnectAttempts > 0,
    reconnectAttempts,
    error,
    lastMessage,
    sendMessage,
    reconnect,
  };
}
