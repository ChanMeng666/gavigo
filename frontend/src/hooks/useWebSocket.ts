import { useEffect, useRef, useState, useCallback } from 'react';
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
  ActivationSpineEvent,
  ErrorPayload,
  ScrollUpdatePayload,
  FocusEventPayload,
  ActivationRequestPayload,
  DemoControlPayload,
  SocialEvent,
  EngagementSummary,
  UserActivityEvent,
} from '../types';

interface UseWebSocketOptions {
  url: string;
  onConnectionEstablished?: (payload: ConnectionEstablishedPayload) => void;
  onDecisionMade?: (payload: AIDecision) => void;
  onContainerStateChange?: (payload: ContainerStateChangePayload) => void;
  onScoreUpdate?: (payload: ScoreUpdatePayload) => void;
  onModeChange?: (payload: ModeChangePayload) => void;
  onStreamInject?: (payload: StreamInjectPayload) => void;
  onResourceUpdate?: (payload: ResourceAllocation) => void;
  onActivationReady?: (payload: ActivationReadyPayload) => void;
  onActivationSpine?: (payload: ActivationSpineEvent) => void;
  onSocialEvent?: (payload: SocialEvent) => void;
  onEngagementUpdate?: (payload: EngagementSummary) => void;
  onUserActivity?: (payload: UserActivityEvent) => void;
  onError?: (payload: ErrorPayload) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    onConnectionEstablished,
    onDecisionMade,
    onContainerStateChange,
    onScoreUpdate,
    onModeChange,
    onStreamInject,
    onResourceUpdate,
    onActivationReady,
    onActivationSpine,
    onSocialEvent,
    onEngagementUpdate,
    onUserActivity,
    onError,
  } = options;

  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
      setSessionId(null);

      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current = ws;
  }, [url]);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection_established':
        const connPayload = message.payload as ConnectionEstablishedPayload;
        setSessionId(connPayload.session_id);
        onConnectionEstablished?.(connPayload);
        break;

      case 'decision_made':
        onDecisionMade?.(message.payload as AIDecision);
        break;

      case 'container_state_change':
        onContainerStateChange?.(message.payload as ContainerStateChangePayload);
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

      case 'activation_spine':
        onActivationSpine?.(message.payload as ActivationSpineEvent);
        break;

      case 'social_event':
        onSocialEvent?.(message.payload as SocialEvent);
        break;

      case 'engagement_update':
        onEngagementUpdate?.(message.payload as EngagementSummary);
        break;

      case 'user_activity':
        onUserActivity?.(message.payload as UserActivityEvent);
        break;

      case 'error':
        onError?.(message.payload as ErrorPayload);
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }, [
    onConnectionEstablished,
    onDecisionMade,
    onContainerStateChange,
    onScoreUpdate,
    onModeChange,
    onStreamInject,
    onResourceUpdate,
    onActivationReady,
    onActivationSpine,
    onSocialEvent,
    onEngagementUpdate,
    onUserActivity,
    onError,
  ]);

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

  const sendScrollUpdate = useCallback((payload: ScrollUpdatePayload) => {
    send('scroll_update', payload);
  }, [send]);

  const sendFocusEvent = useCallback((payload: FocusEventPayload) => {
    send('focus_event', payload);
  }, [send]);

  const sendActivationRequest = useCallback((payload: ActivationRequestPayload) => {
    send('activation_request', payload);
  }, [send]);

  const sendDeactivation = useCallback((contentId: string) => {
    send('deactivation', { content_id: contentId });
  }, [send]);

  const sendDemoControl = useCallback((payload: DemoControlPayload) => {
    send('demo_control', payload);
  }, [send]);

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
