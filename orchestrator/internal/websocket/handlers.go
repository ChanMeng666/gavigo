package websocket

import (
	"encoding/json"
	"log"
)

// MessageHandler handles incoming WebSocket messages
type MessageHandler struct {
	hub *Hub

	// Callbacks for different message types
	OnScrollUpdate      func(client *Client, position int, velocity float64, visibleContent []string)
	OnFocusEvent        func(client *Client, contentID string, durationMS int, theme string)
	OnActivationRequest func(client *Client, contentID string)
	OnDeactivation      func(client *Client, contentID string)
	OnDemoControl       func(client *Client, action string, targetContentID string, value float64)
	OnScreenView        func(client *Client, screenName string)
	OnUserAction        func(client *Client, action string, screen string, value string)
}

// NewMessageHandler creates a new message handler
func NewMessageHandler(hub *Hub) *MessageHandler {
	return &MessageHandler{hub: hub}
}

// Setup configures the hub to use this handler
func (h *MessageHandler) Setup() {
	h.hub.SetMessageHandler(h.handleMessage)
}

func (h *MessageHandler) handleMessage(client *Client, messageType string, payload json.RawMessage) {
	log.Printf("Received message type: %s from client: %s", messageType, client.SessionID)

	switch messageType {
	case "scroll_update":
		var p struct {
			Position       int      `json:"position"`
			Velocity       float64  `json:"velocity"`
			VisibleContent []string `json:"visible_content"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing scroll_update: %v", err)
			return
		}
		if h.OnScrollUpdate != nil {
			h.OnScrollUpdate(client, p.Position, p.Velocity, p.VisibleContent)
		}

	case "focus_event":
		var p struct {
			ContentID  string `json:"content_id"`
			DurationMS int    `json:"duration_ms"`
			Theme      string `json:"theme"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing focus_event: %v", err)
			return
		}
		if h.OnFocusEvent != nil {
			h.OnFocusEvent(client, p.ContentID, p.DurationMS, p.Theme)
		}

	case "activation_request":
		var p struct {
			ContentID string `json:"content_id"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing activation_request: %v", err)
			return
		}
		if h.OnActivationRequest != nil {
			h.OnActivationRequest(client, p.ContentID)
		}

	case "deactivation":
		var p struct {
			ContentID string `json:"content_id"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing deactivation: %v", err)
			return
		}
		if h.OnDeactivation != nil {
			h.OnDeactivation(client, p.ContentID)
		}

	case "demo_control":
		var p struct {
			Action          string  `json:"action"`
			TargetContentID string  `json:"target_content_id"`
			Value           float64 `json:"value"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing demo_control: %v", err)
			return
		}
		if h.OnDemoControl != nil {
			h.OnDemoControl(client, p.Action, p.TargetContentID, p.Value)
		}

	case "screen_view":
		var p struct {
			ScreenName string `json:"screen_name"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing screen_view: %v", err)
			return
		}
		if h.OnScreenView != nil {
			h.OnScreenView(client, p.ScreenName)
		}

	case "user_action":
		var p struct {
			Action string `json:"action"`
			Screen string `json:"screen"`
			Value  string `json:"value,omitempty"`
		}
		if err := json.Unmarshal(payload, &p); err != nil {
			log.Printf("Error parsing user_action: %v", err)
			return
		}
		if h.OnUserAction != nil {
			h.OnUserAction(client, p.Action, p.Screen, p.Value)
		}

	default:
		log.Printf("Unknown message type: %s", messageType)
	}
}
