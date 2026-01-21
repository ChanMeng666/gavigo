package api

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gavigo/orchestrator/internal/engine"
	"github.com/gavigo/orchestrator/internal/models"
)

// Handlers provides HTTP handlers for the REST API
type Handlers struct {
	content         []models.ContentItem
	containerStates map[string]models.ContainerStatus
	decisions       []*models.AIDecision
	scorer          *engine.Scorer
	currentMode     models.OperationalMode

	// Dependencies
	OnTrendSpike func(contentID string, viralScore float64)
	OnReset      func()
}

// NewHandlers creates new API handlers
func NewHandlers(scorer *engine.Scorer) *Handlers {
	content := models.DefaultContent()
	states := make(map[string]models.ContainerStatus)
	for _, c := range content {
		states[c.ID] = c.ContainerStatus
	}

	return &Handlers{
		content:         content,
		containerStates: states,
		decisions:       make([]*models.AIDecision, 0),
		scorer:          scorer,
		currentMode:     models.ModeMixedStreamBrowsing,
	}
}

// AddDecision adds a decision to the history
func (h *Handlers) AddDecision(decision *models.AIDecision) {
	h.decisions = append([]*models.AIDecision{decision}, h.decisions...)
	if len(h.decisions) > 100 {
		h.decisions = h.decisions[:100]
	}
}

// UpdateContainerState updates the state of a container
func (h *Handlers) UpdateContainerState(contentID string, state models.ContainerStatus) {
	h.containerStates[contentID] = state
	for i := range h.content {
		if h.content[i].ID == contentID {
			h.content[i].ContainerStatus = state
			break
		}
	}
}

// SetMode sets the current operational mode
func (h *Handlers) SetMode(mode models.OperationalMode) {
	h.currentMode = mode
}

// GetCurrentMode returns the current operational mode
func (h *Handlers) GetCurrentMode() models.OperationalMode {
	return h.currentMode
}

// GetContent returns all content items
func (h *Handlers) GetContent() []models.ContentItem {
	return h.content
}

// GetContentByID returns a content item by ID
func (h *Handlers) GetContentByID(id string) *models.ContentItem {
	for i := range h.content {
		if h.content[i].ID == id {
			return &h.content[i]
		}
	}
	return nil
}

// RegisterRoutes registers all HTTP routes
func (h *Handlers) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/v1/health", h.handleHealth)
	mux.HandleFunc("/api/v1/content", h.handleContent)
	mux.HandleFunc("/api/v1/containers", h.handleContainers)
	mux.HandleFunc("/api/v1/decisions", h.handleDecisions)
	mux.HandleFunc("/api/v1/scores", h.handleScores)
	mux.HandleFunc("/api/v1/mode", h.handleMode)
	mux.HandleFunc("/api/v1/resources", h.handleResources)
	mux.HandleFunc("/api/v1/demo/reset", h.handleDemoReset)
	mux.HandleFunc("/api/v1/demo/trend-spike", h.handleTrendSpike)
}

func (h *Handlers) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]string{
		"status":     "healthy",
		"redis":      "connected",
		"kubernetes": "connected",
	}

	h.writeJSON(w, response)
}

func (h *Handlers) handleContent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Update scores in content items
	for i := range h.content {
		scores := h.scorer.GetScores("default", h.content[i].ID)
		h.content[i].PersonalScore = scores.PersonalScore
		h.content[i].GlobalScore = scores.GlobalScore
		h.content[i].CombinedScore = scores.CombinedScore
	}

	h.writeJSON(w, h.content)
}

func (h *Handlers) handleContainers(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := make(map[string]interface{})
	for _, c := range h.content {
		response[c.ID] = map[string]interface{}{
			"content_id":        c.ID,
			"status":            h.containerStates[c.ID],
			"deployment_name":   c.DeploymentName,
			"replicas":          h.getReplicasForState(h.containerStates[c.ID]),
			"ready_replicas":    h.getReplicasForState(h.containerStates[c.ID]),
			"last_state_change": "",
		}
	}

	h.writeJSON(w, response)
}

func (h *Handlers) handleDecisions(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	limit := 50
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	decisions := h.decisions
	if len(decisions) > limit {
		decisions = decisions[:limit]
	}

	h.writeJSON(w, decisions)
}

func (h *Handlers) handleScores(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := make(map[string]interface{})
	for _, c := range h.content {
		scores := h.scorer.GetScores("default", c.ID)
		response[c.ID] = map[string]interface{}{
			"personal_score":     scores.PersonalScore,
			"global_score":       scores.GlobalScore,
			"combined_score":     scores.CombinedScore,
			"threshold_exceeded": scores.CombinedScore >= 0.6,
		}
	}

	h.writeJSON(w, response)
}

func (h *Handlers) handleMode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var activeContentID *string
	for _, c := range h.content {
		if h.containerStates[c.ID] == models.StatusHot {
			activeContentID = &c.ID
			break
		}
	}

	response := map[string]interface{}{
		"current_mode":      h.currentMode,
		"active_content_id": activeContentID,
		"since":             "",
	}

	h.writeJSON(w, response)
}

func (h *Handlers) handleResources(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	allocation := models.DefaultResourceAllocation(h.currentMode)
	h.writeJSON(w, allocation)
}

func (h *Handlers) handleDemoReset(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Reset all container states to COLD
	for id := range h.containerStates {
		h.containerStates[id] = models.StatusCold
	}

	// Reset content
	h.content = models.DefaultContent()
	for _, c := range h.content {
		h.containerStates[c.ID] = c.ContainerStatus
	}

	// Reset decisions
	h.decisions = make([]*models.AIDecision, 0)

	// Reset mode
	h.currentMode = models.ModeMixedStreamBrowsing

	// Reset scorer
	h.scorer.Reset()

	// Call external reset callback if set
	if h.OnReset != nil {
		h.OnReset()
	}

	log.Println("Demo reset completed")
	h.writeJSON(w, map[string]string{"message": "Demo reset completed"})
}

func (h *Handlers) handleTrendSpike(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ContentID  string  `json:"content_id"`
		ViralScore float64 `json:"viral_score"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set the trend score
	h.scorer.SetTrendScore(req.ContentID, req.ViralScore, "RISING")

	// Call external callback if set
	if h.OnTrendSpike != nil {
		h.OnTrendSpike(req.ContentID, req.ViralScore)
	}

	log.Printf("Trend spike triggered: content=%s, viral=%.2f", req.ContentID, req.ViralScore)

	h.writeJSON(w, map[string]interface{}{
		"content_id":      req.ContentID,
		"new_viral_score": req.ViralScore,
	})
}

func (h *Handlers) writeJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}

func (h *Handlers) getReplicasForState(state models.ContainerStatus) int {
	switch state {
	case models.StatusCold:
		return 0
	case models.StatusWarm:
		return 1
	case models.StatusHot:
		return 2
	default:
		return 0
	}
}
