package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gavigo/orchestrator/internal/api"
	"github.com/gavigo/orchestrator/internal/config"
	"github.com/gavigo/orchestrator/internal/engine"
	"github.com/gavigo/orchestrator/internal/k8s"
	"github.com/gavigo/orchestrator/internal/models"
	"github.com/gavigo/orchestrator/internal/websocket"
)

func main() {
	log.Println("Starting GAVIGO Orchestrator...")

	// Load configuration
	cfg := config.Load()
	log.Printf("Configuration loaded: port=%s", cfg.Port)

	// Initialize K8s client and throttler (optional - for K8s environments)
	var throttler *k8s.Throttler
	namespace := os.Getenv("K8S_NAMESPACE")
	if namespace == "" {
		namespace = "gavigo"
	}

	if k8sClient, err := k8s.NewClient(namespace); err != nil {
		log.Printf("K8s client not available (running in local mode): %v", err)
	} else {
		log.Println("K8s client initialized successfully")
		throttler = k8s.NewThrottler(k8sClient, k8s.DefaultThrottleConfig())
	}

	// Define workload deployment names
	workloadDeployments := []string{"game-football", "game-scifi", "ai-service"}

	// Initialize scorer
	scorer := engine.NewScorer(nil)
	scorer.StartDecay()

	// Initialize rules engine
	rulesEngine := engine.NewRulesEngine(nil)

	// Initialize WebSocket hub
	hub := websocket.NewHub()
	go hub.Run()

	// Initialize API handlers
	handlers := api.NewHandlers(scorer)

	// Initialize message handler
	msgHandler := websocket.NewMessageHandler(hub)
	msgHandler.Setup()

	// Wire up callbacks
	rulesEngine.OnDecision = func(decision *models.AIDecision) {
		handlers.AddDecision(decision)
		hub.BroadcastDecision(decision)
	}

	rulesEngine.OnScaleAction = func(contentID string, targetState models.ContainerStatus) {
		handlers.UpdateContainerState(contentID, targetState)
		hub.BroadcastContainerStateChange(contentID, targetState)
	}

	rulesEngine.OnModeChange = func(oldMode, newMode models.OperationalMode, reason string) {
		handlers.SetMode(newMode)
		hub.BroadcastModeChange(oldMode, newMode, reason)
	}

	rulesEngine.OnInject = func(content *models.ContentItem, position int, reason string) {
		hub.BroadcastStreamInject(content, position, reason)
	}

	// Wire up resource throttling (only if K8s is available)
	rulesEngine.OnThrottleAction = func(activeContentID string, mode models.OperationalMode) {
		if throttler == nil {
			log.Printf("Throttle action requested but K8s not available (simulated mode)")
			// Broadcast resource allocation update for visualization
			allocation := models.DefaultResourceAllocation(mode)
			hub.BroadcastResourceUpdate(&allocation)
			return
		}

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		if mode == models.ModeGameFocus || mode == models.ModeAIServiceFocus {
			// Throttle background workloads when entering focused mode
			// Find the deployment name for the active content
			content := handlers.GetContentByID(activeContentID)
			deploymentName := ""
			if content != nil {
				deploymentName = content.DeploymentName
			}
			if err := throttler.ThrottleForForeground(ctx, deploymentName, workloadDeployments); err != nil {
				log.Printf("Warning: throttle action failed: %v", err)
			}
		} else {
			// Restore resources when returning to mixed browsing
			if err := throttler.RestoreResources(ctx, workloadDeployments); err != nil {
				log.Printf("Warning: restore resources failed: %v", err)
			}
		}

		// Broadcast resource allocation update
		allocation := models.DefaultResourceAllocation(mode)
		hub.BroadcastResourceUpdate(&allocation)
		log.Printf("Resource throttling applied for mode: %s", mode)
	}

	scorer.OnScoreUpdate = func(contentID string, scores *models.InputScores) {
		content := handlers.GetContentByID(contentID)
		var currentState models.ContainerStatus
		if content != nil {
			currentState = content.ContainerStatus
		}
		rulesEngine.ProcessScoreUpdate(contentID, scores, currentState)
		hub.BroadcastScoreUpdate(contentID, scores)
	}

	// Wire up message handlers
	msgHandler.OnScrollUpdate = func(client *websocket.Client, position int, velocity float64, visibleContent []string) {
		// Convert content to pointers for rules engine
		allContent := handlers.GetContent()
		contentPtrs := make([]*models.ContentItem, len(allContent))
		for i := range allContent {
			contentPtrs[i] = &allContent[i]
		}

		// Process scroll update for lookahead warming
		rulesEngine.ProcessScrollUpdate(visibleContent, contentPtrs)

		log.Printf("Scroll update: position=%d, velocity=%.2f, visible=%d items",
			position, velocity, len(visibleContent))
	}

	msgHandler.OnFocusEvent = func(client *websocket.Client, contentID string, durationMS int, theme string) {
		scores := scorer.RecordFocusEvent(client.SessionID, contentID, durationMS, theme)

		// Get content and session for rules processing
		content := handlers.GetContentByID(contentID)
		if content == nil {
			log.Printf("Content not found: %s", contentID)
			return
		}

		// Create a simple session for rules processing
		session := models.NewSession(client.SessionID)

		// Convert content slice to pointer slice
		allContent := handlers.GetContent()
		contentPtrs := make([]*models.ContentItem, len(allContent))
		for i := range allContent {
			contentPtrs[i] = &allContent[i]
		}

		// Get all scores
		allScores := scorer.GetAllScores(client.SessionID)

		rulesEngine.ProcessFocusEvent(session, content, durationMS, contentPtrs, allScores)

		log.Printf("Focus event processed: session=%s, content=%s, duration=%dms, score=%.2f",
			client.SessionID, contentID, durationMS, scores.CombinedScore)
	}

	msgHandler.OnActivationRequest = func(client *websocket.Client, contentID string) {
		content := handlers.GetContentByID(contentID)
		if content == nil {
			log.Printf("Content not found for activation: %s", contentID)
			return
		}

		// Scale to HOT
		handlers.UpdateContainerState(contentID, models.StatusHot)
		hub.BroadcastContainerStateChange(contentID, models.StatusHot)

		// Send activation ready
		client.Send(websocket.Message{
			Type: "activation_ready",
			Payload: map[string]interface{}{
				"content_id":   contentID,
				"endpoint_url": "/workloads/" + content.DeploymentName,
				"status":       models.StatusHot,
			},
		})

		log.Printf("Content activated: %s", contentID)
	}

	msgHandler.OnDeactivation = func(client *websocket.Client, contentID string) {
		// Scale back to WARM
		handlers.UpdateContainerState(contentID, models.StatusWarm)
		hub.BroadcastContainerStateChange(contentID, models.StatusWarm)

		log.Printf("Content deactivated: %s", contentID)
	}

	msgHandler.OnDemoControl = func(client *websocket.Client, action, targetContentID string, value float64) {
		switch action {
		case "trigger_trend_spike":
			scorer.SetTrendScore(targetContentID, value, "RISING")
			scores := scorer.GetScores(client.SessionID, targetContentID)
			content := handlers.GetContentByID(targetContentID)
			if content != nil {
				rulesEngine.ProcessTrendSpike(targetContentID, value, scores, content.ContainerStatus)
			}
		case "reset_demo":
			handlers.OnReset()
		case "force_warm":
			handlers.UpdateContainerState(targetContentID, models.StatusWarm)
			hub.BroadcastContainerStateChange(targetContentID, models.StatusWarm)
		case "force_cold":
			handlers.UpdateContainerState(targetContentID, models.StatusCold)
			hub.BroadcastContainerStateChange(targetContentID, models.StatusCold)
		}

		log.Printf("Demo control: action=%s, target=%s, value=%.2f", action, targetContentID, value)
	}

	handlers.OnTrendSpike = func(contentID string, viralScore float64) {
		scores := scorer.GetScores("default", contentID)
		content := handlers.GetContentByID(contentID)
		if content != nil {
			rulesEngine.ProcessTrendSpike(contentID, viralScore, scores, content.ContainerStatus)
		}
	}

	handlers.OnReset = func() {
		scorer.Reset()
		log.Println("Full reset triggered via API")
	}

	// Trigger initial warming for first 2 content items
	// This ensures users see "Activate" instead of "Not Ready" on page load
	go func() {
		// Small delay to ensure everything is initialized
		time.Sleep(100 * time.Millisecond)
		allContent := handlers.GetContent()
		contentPtrs := make([]*models.ContentItem, len(allContent))
		for i := range allContent {
			contentPtrs[i] = &allContent[i]
		}
		rulesEngine.ProcessInitialLoad(contentPtrs, 2)
		log.Println("Initial warming completed for first 2 content items")
	}()

	// Set up HTTP server
	mux := http.NewServeMux()

	// Register API routes
	handlers.RegisterRoutes(mux)

	// WebSocket endpoint
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		websocket.ServeWs(hub, w, r, handlers.GetContent(), handlers.GetCurrentMode())
	})

	// Serve static files for frontend (in production)
	mux.Handle("/", http.FileServer(http.Dir("./static")))

	server := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: mux,
	}

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
		<-sigChan

		log.Println("Shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			log.Printf("Server shutdown error: %v", err)
		}
	}()

	log.Printf("Server starting on port %s", cfg.Port)
	if err := server.ListenAndServe(); err != http.ErrServerClosed {
		log.Fatalf("Server error: %v", err)
	}

	log.Println("Server stopped")
}
