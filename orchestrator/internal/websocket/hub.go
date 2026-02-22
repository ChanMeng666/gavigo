package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/gavigo/orchestrator/internal/models"
)

// Message represents a WebSocket message
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// Hub maintains the set of active clients and broadcasts messages
type Hub struct {
	// Registered clients
	clients map[*Client]bool

	// Inbound messages from clients
	broadcast chan []byte

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Message handler callback
	messageHandler func(client *Client, messageType string, payload json.RawMessage)

	mu sync.RWMutex
}

// NewHub creates a new Hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// SetMessageHandler sets the callback for handling client messages
func (h *Hub) SetMessageHandler(handler func(client *Client, messageType string, payload json.RawMessage)) {
	h.messageHandler = handler
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("Client registered: %s (total: %d)", client.SessionID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("Client unregistered: %s (total: %d)", client.SessionID, len(h.clients))

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast sends a message to all clients
func (h *Hub) Broadcast(message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling broadcast message: %v", err)
		return
	}
	h.broadcast <- data
}

// BroadcastRaw sends raw bytes to all clients
func (h *Hub) BroadcastRaw(data []byte) {
	h.broadcast <- data
}

// SendToClient sends a message to a specific client
func (h *Hub) SendToClient(sessionID string, message interface{}) {
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for client := range h.clients {
		if client.SessionID == sessionID {
			select {
			case client.send <- data:
			default:
				log.Printf("Client %s send buffer full", sessionID)
			}
			return
		}
	}
}

// GetClientCount returns the number of connected clients
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}

// GetClients returns all connected client session IDs
func (h *Hub) GetClients() []string {
	h.mu.RLock()
	defer h.mu.RUnlock()

	ids := make([]string, 0, len(h.clients))
	for client := range h.clients {
		ids = append(ids, client.SessionID)
	}
	return ids
}

// HandleClientMessage is called when a message is received from a client
func (h *Hub) HandleClientMessage(client *Client, data []byte) {
	if h.messageHandler == nil {
		log.Println("No message handler set")
		return
	}

	// Parse the message type first
	var msg struct {
		Type    string          `json:"type"`
		Payload json.RawMessage `json:"payload"`
	}
	if err := json.Unmarshal(data, &msg); err != nil {
		log.Printf("Error parsing message: %v", err)
		return
	}

	h.messageHandler(client, msg.Type, msg.Payload)
}

// BroadcastDecision sends a decision to all clients
func (h *Hub) BroadcastDecision(decision *models.AIDecision) {
	h.Broadcast(Message{
		Type:    "decision_made",
		Payload: decision,
	})
}

// BroadcastContainerStateChange sends a container state change to all clients
func (h *Hub) BroadcastContainerStateChange(contentID string, oldState, newState models.ContainerStatus) {
	h.Broadcast(Message{
		Type: "container_state_change",
		Payload: map[string]interface{}{
			"content_id":      contentID,
			"old_state":       oldState,
			"new_state":       newState,
			"deployment_name": "",
			"timestamp":       time.Now().Format(time.RFC3339),
		},
	})
}

// BroadcastActivationSpine sends an activation spine event to all clients
func (h *Hub) BroadcastActivationSpine(event *models.ActivationSpineEvent) {
	h.Broadcast(Message{
		Type:    "activation_spine",
		Payload: event,
	})
}

// BroadcastModeChange sends a mode change to all clients
func (h *Hub) BroadcastModeChange(oldMode, newMode models.OperationalMode, reason string) {
	h.Broadcast(Message{
		Type: "mode_change",
		Payload: map[string]interface{}{
			"old_mode":  oldMode,
			"new_mode":  newMode,
			"reason":    reason,
			"timestamp": time.Now().Format(time.RFC3339),
		},
	})
}

// BroadcastScoreUpdate sends a score update to all clients
func (h *Hub) BroadcastScoreUpdate(contentID string, scores *models.InputScores) {
	h.Broadcast(Message{
		Type: "score_update",
		Payload: map[string]interface{}{
			"content_id":         contentID,
			"personal_score":     scores.PersonalScore,
			"global_score":       scores.GlobalScore,
			"combined_score":     scores.CombinedScore,
			"threshold_exceeded": scores.CombinedScore >= 0.6,
		},
	})
}

// BroadcastStreamInject sends a stream inject to all clients
func (h *Hub) BroadcastStreamInject(content *models.ContentItem, position int, reason string) {
	h.Broadcast(Message{
		Type: "stream_inject",
		Payload: map[string]interface{}{
			"content":         content,
			"insert_position": position,
			"reason":          reason,
		},
	})
}

// BroadcastResourceUpdate sends a resource update to all clients
func (h *Hub) BroadcastResourceUpdate(allocation *models.ResourceAllocation) {
	h.Broadcast(Message{
		Type:    "resource_update",
		Payload: allocation,
	})
}

// BroadcastSocialEvent sends a social event to all clients
func (h *Hub) BroadcastSocialEvent(event *models.SocialEventPayload) {
	h.Broadcast(Message{
		Type:    "social_event",
		Payload: event,
	})
}

// BroadcastEngagement sends an engagement summary to all clients
func (h *Hub) BroadcastEngagement(summary *models.EngagementSummary) {
	h.Broadcast(Message{
		Type:    "engagement_update",
		Payload: summary,
	})
}

// BroadcastUserActivity sends a user activity event to all clients
func (h *Hub) BroadcastUserActivity(event *models.UserActivityEvent) {
	h.Broadcast(Message{
		Type:    "user_activity",
		Payload: event,
	})
}

// BroadcastProofSignal sends a proof signal event to all clients
func (h *Hub) BroadcastProofSignal(event *models.ProofSignalEvent) {
	h.Broadcast(Message{
		Type:    "proof_signal",
		Payload: event,
	})
}

// BroadcastTelemetryUpdate sends a telemetry snapshot to all clients
func (h *Hub) BroadcastTelemetryUpdate(snapshot *models.TelemetrySnapshot) {
	h.Broadcast(Message{
		Type:    "telemetry_update",
		Payload: snapshot,
	})
}
