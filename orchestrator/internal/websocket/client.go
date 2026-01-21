package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"github.com/gavigo/orchestrator/internal/models"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 512 * 1024 // 512KB
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for demo
	},
}

// Client represents a WebSocket client connection
type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	send      chan []byte
	SessionID string
}

// NewClient creates a new client from an HTTP connection
func NewClient(hub *Hub, w http.ResponseWriter, r *http.Request) (*Client, error) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return nil, err
	}

	client := &Client{
		hub:       hub,
		conn:      conn,
		send:      make(chan []byte, 256),
		SessionID: uuid.New().String(),
	}

	// Register client with hub
	hub.register <- client

	return client, nil
}

// ReadPump pumps messages from the WebSocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		// Handle the message through the hub
		c.hub.HandleClientMessage(c, message)
	}
}

// WritePump pumps messages from the hub to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Send sends a message to this client
func (c *Client) Send(msg Message) {
	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("Error marshaling message: %v", err)
		return
	}
	select {
	case c.send <- data:
	default:
		log.Printf("Client %s send buffer full, dropping message", c.SessionID)
	}
}

// SendRaw sends raw bytes to this client
func (c *Client) SendRaw(data []byte) {
	select {
	case c.send <- data:
	default:
		log.Printf("Client %s send buffer full, dropping message", c.SessionID)
	}
}

// ServeWs handles websocket requests from the peer
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, initialContent []models.ContentItem, currentMode models.OperationalMode) {
	client, err := NewClient(hub, w, r)
	if err != nil {
		log.Printf("Error upgrading WebSocket connection: %v", err)
		return
	}

	// Send initial connection established message
	containerStates := make(map[string]models.ContainerStatus)
	for _, c := range initialContent {
		containerStates[c.ID] = c.ContainerStatus
	}

	client.Send(Message{
		Type: "connection_established",
		Payload: map[string]interface{}{
			"session_id":       client.SessionID,
			"initial_content":  initialContent,
			"current_mode":     currentMode,
			"container_states": containerStates,
		},
	})

	// Start goroutines for reading and writing
	go client.WritePump()
	go client.ReadPump()
}
