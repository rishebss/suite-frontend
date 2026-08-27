import { useEffect, useRef, useCallback } from "react";

const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

const useWebSocket = ({ workspaceId, projectId, onMessage, enabled = true }) => {
  const wsRef = useRef(null);
  const reconnectAttemptRef = useRef(0);
  const timerRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const enabledRef = useRef(enabled);

  onMessageRef.current = onMessage;
  enabledRef.current = enabled;

  const connect = useCallback(() => {
    if (!enabledRef.current || !workspaceId) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    const baseUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
    const path = projectId
      ? `/ws/work/${workspaceId}/${projectId}/`
      : `/ws/work/${workspaceId}/`;
    const url = `${baseUrl}${path}?token=${token}`;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch {
        // ignore
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
      reconnectAttemptRef.current += 1;
      timerRef.current = setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [workspaceId, projectId]);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimeout(timerRef.current);
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    return disconnect;
  }, [enabled, connect, disconnect]);

  return { send, disconnect };
};

export default useWebSocket;
