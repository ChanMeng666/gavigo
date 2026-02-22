// Global WebSocket event sender for screens that don't own the WebSocket connection.
// The feed screen's useWebSocket hook populates these functions.

type SendFn = (type: string, payload: unknown) => void;

let _send: SendFn | null = null;

export function setGlobalSend(send: SendFn | null) {
  _send = send;
}

export function sendScreenView(screenName: string) {
  _send?.('screen_view', { screen_name: screenName });
}

export function sendUserAction(payload: {
  action: string;
  screen: string;
  value?: string;
}) {
  _send?.('user_action', payload);
}
