package models

import (
	_ "embed"
	"encoding/json"
	"log"
)

type ContentType string

const (
	ContentTypeGame      ContentType = "GAME"
	ContentTypeAIService ContentType = "AI_SERVICE"
)

type ContainerStatus string

const (
	StatusCold ContainerStatus = "COLD"
	StatusWarm ContainerStatus = "WARM"
	StatusHot  ContainerStatus = "HOT"
)

type ContentItem struct {
	ID              string          `json:"id"`
	Type            ContentType     `json:"type"`
	Theme           string          `json:"theme"`
	Title           string          `json:"title"`
	Description     string          `json:"description"`
	ThumbnailURL    string          `json:"thumbnail_url"`
	ContainerStatus ContainerStatus `json:"container_status"`
	DeploymentName  string          `json:"deployment_name"`
	PersonalScore   float64         `json:"personal_score"`
	GlobalScore     float64         `json:"global_score"`
	CombinedScore   float64         `json:"combined_score"`
}

//go:embed games.json
var gamesJSON []byte

// Parsed shared game data structures
type gameEntry struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Theme       string `json:"theme"`
	Description string `json:"description"`
	Thumbnail   string `json:"thumbnail"`
}

type studioEntry struct {
	Games []gameEntry `json:"games"`
}

type gamesData struct {
	Studios              []studioEntry     `json:"studios"`
	CrossDomainRelations map[string]string `json:"crossDomainRelations"`
}

// CrossDomainRelations maps content IDs to related content IDs
var CrossDomainRelations map[string]string

// defaultContent holds the parsed content items
var defaultContent []ContentItem

func init() {
	var data gamesData
	if err := json.Unmarshal(gamesJSON, &data); err != nil {
		log.Fatalf("failed to parse embedded games.json: %v", err)
	}

	CrossDomainRelations = data.CrossDomainRelations

	for _, studio := range data.Studios {
		for _, game := range studio.Games {
			defaultContent = append(defaultContent, ContentItem{
				ID:              game.ID,
				Type:            ContentTypeGame,
				Theme:           game.Theme,
				Title:           game.Title,
				Description:     game.Description,
				ThumbnailURL:    game.Thumbnail,
				ContainerStatus: StatusCold,
				DeploymentName:  game.ID,
			})
		}
	}

	// Add AI service (not in games.json)
	defaultContent = append(defaultContent, ContentItem{
		ID:              "ai-service-tech",
		Type:            ContentTypeAIService,
		Theme:           "tech",
		Title:           "AI Assistant",
		Description:     "Smart AI helper powered by OpenAI",
		ThumbnailURL:    "/assets/ai-service.png",
		ContainerStatus: StatusCold,
		DeploymentName:  "ai-service",
	})
}

// DefaultContent returns the initial content items for the demo
func DefaultContent() []ContentItem {
	items := make([]ContentItem, len(defaultContent))
	copy(items, defaultContent)
	return items
}
