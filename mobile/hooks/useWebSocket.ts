import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getWsUrl } from '@/services/api';
import type {
  WebSocketMessage,
  ConnectionEstablishedPayload,
  AIDecision,
  ContainerStateChangePayload,
  ScoreUpdatePayload,
  ModeChangePayload,
  StreamInjectPayload,
  ResourceAllocation,
  ActivationReadyPayload,
  ErrorPayload,
  ScrollUpdatePayload,
  FocusEventPayload,
  ActivationRequestPayload,
  DemoControlPayload,
} from '@/types';

interface UseWebSocketOptions {
  onConnectionEstablished?: (payload: ConnectionEstablishedPayload) => void;
  onDecisionMade?: (payload: AIDecision) => void;
  onContainerStateChange?: (payload: ContainerStateChangePayload) => void;
  onScoreUpdate?: (payload: ScoreUpdatePayload) => void;
  onModeChange?: (payload: ModeChangePayload) => void;
  onStreamInject?: (payload: StreamInjectPayload) => void;
  onResourceUpdate?: (payload: ResourceAllocation) => void;
  onActivationReady?: (payload: ActivationReadyPayload) => void;
  onError?: (payload: ErrorPayload) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    onConnectionEstablished,
    onDecisionMade,
    onContainerStateChange,
    onScoreUpdate,
    onModeChange,
    onStreamInject,
    onResourceUpdate,
    onActivationReady,
    onError,
  } = options;

  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMessage = useCallback(
    (message: WebSocketMessage) => {
      switch (message.type) {
        case 'connection_established': {
          const connPayload = message.payload as ConnectionEstablishedPayload;
          setSessionId(connPayload.session_id);
          onConnectionEstablished?.(connPayload);
          break;
        }
        case 'decision_made':
          onDecisionMade?.(message.payload as AIDecision);
          break;
        case 'container_state_change':
          onContainerStateChange?.(
            message.payload as ContainerStateChangePayload
          );
          break;
        case 'score_update':
          onScoreUpdate?.(message.payload as ScoreUpdatePayload);
          break;
        case 'mode_change':
          onModeChange?.(message.payload as ModeChangePayload);
          break;
        case 'stream_inject':
          onStreamInject?.(message.payload as StreamInjectPayload);
          break;
        case 'resource_update':
          onResourceUpdate?.(message.payload as ResourceAllocation);
          break;
        case 'activation_ready':
          onActivationReady?.(message.payload as ActivationReadyPayload);
          break;
        case 'error':
          onError?.(message.payload as ErrorPayload);
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    },
    [
      onConnectionEstablished,
      onDecisionMade,
      onContainerStateChange,
      onScoreUpdate,
      onModeChange,
      onStreamInject,
      onResourceUpdate,
      onActivationReady,
      onError,
    ]
  );

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = useAuthStore.getState().idToken;
    const url = token ? `${getWsUrl()}?token=${token}` : getWsUrl();
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      setSessionId(null);

      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data as string);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current = ws;
  }, [handleMessage]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((type: string, payload: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('WebSocket not connected, cannot send message');
    }
  }, []);

  const sendScrollUpdate = useCallback(
    (payload: ScrollUpdatePayload) => {
      send('scroll_update', payload);
    },
    [send]
  );

  const sendFocusEvent = useCallback(
    (payload: FocusEventPayload) => {
      send('focus_event', payload);
    },
    [send]
  );

  const sendActivationRequest = useCallback(
    (payload: ActivationRequestPayload) => {
      send('activation_request', payload);
    },
    [send]
  );

  const sendDeactivation = useCallback(
    (contentId: string) => {
      send('deactivation', { content_id: contentId });
    },
    [send]
  );

  const sendDemoControl = useCallback(
    (payload: DemoControlPayload) => {
      send('demo_control', payload);
    },
    [send]
  );

  return {
    connected,
    sessionId,
    send,
    sendScrollUpdate,
    sendFocusEvent,
    sendActivationRequest,
    sendDeactivation,
    sendDemoControl,
  };
}
