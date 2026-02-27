package models

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

// CrossDomainRelations maps content IDs to related content IDs
var CrossDomainRelations = map[string]string{
	"game-clicker-heroes": "ai-service-tech",
	"game-mrmine":         "game-grindcraft",
	"game-poker-quest":    "ai-service-tech",
	"game-grindcraft":     "game-mrmine",
	"game-fray-fight":     "game-clicker-heroes",
	"ai-service-tech":     "game-poker-quest",
	"game-2048":           "game-slice-master",
	"game-slice-master":   "game-tiny-fishing",
	"game-space-waves":    "game-drift-boss",
	"game-drift-boss":     "game-space-waves",
	"game-tiny-fishing":   "game-slice-master",
}

// DefaultContent returns the initial content items for the demo
func DefaultContent() []ContentItem {
	return []ContentItem{
		// Games (external iframe)
		{
			ID:              "game-clicker-heroes",
			Type:            ContentTypeGame,
			Theme:           "idle",
			Title:           "Clicker Heroes",
			Description:     "150M+ plays - #2 on Kongregate all time",
			ThumbnailURL:    "/assets/game-clicker-heroes.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-clicker-heroes",
		},
		{
			ID:              "game-mrmine",
			Type:            ContentTypeGame,
			Theme:           "mining",
			Title:           "Mr.Mine",
			Description:     "20M+ plays - Idle mining game",
			ThumbnailURL:    "/assets/game-mrmine.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-mrmine",
		},
		{
			ID:              "game-poker-quest",
			Type:            ContentTypeGame,
			Theme:           "cards",
			Title:           "Poker Quest",
			Description:     "Roguelike poker adventure game",
			ThumbnailURL:    "/assets/game-poker-quest.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-poker-quest",
		},
		{
			ID:              "game-grindcraft",
			Type:            ContentTypeGame,
			Theme:           "craft",
			Title:           "Grindcraft",
			Description:     "10M+ plays - Minecraft-style idle crafting",
			ThumbnailURL:    "/assets/game-grindcraft.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-grindcraft",
		},
		{
			ID:              "game-fray-fight",
			Type:            ContentTypeGame,
			Theme:           "fighting",
			Title:           "Fray Fight",
			Description:     "Action-packed fighting game",
			ThumbnailURL:    "/assets/game-fray-fight.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-fray-fight",
		},
		// Lightweight casual games (CrazyGames)
		{
			ID:              "game-2048",
			Type:            ContentTypeGame,
			Theme:           "puzzle",
			Title:           "2048",
			Description:     "Classic number puzzle - merge tiles to reach 2048",
			ThumbnailURL:    "/assets/game-2048.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-2048",
		},
		{
			ID:              "game-slice-master",
			Type:            ContentTypeGame,
			Theme:           "casual",
			Title:           "Slice Master",
			Description:     "Satisfying slicing action - cut everything!",
			ThumbnailURL:    "/assets/game-slice-master.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-slice-master",
		},
		{
			ID:              "game-space-waves",
			Type:            ContentTypeGame,
			Theme:           "arcade",
			Title:           "Space Waves",
			Description:     "Dodge obstacles in space - one-tap arcade action",
			ThumbnailURL:    "/assets/game-space-waves.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-space-waves",
		},
		{
			ID:              "game-drift-boss",
			Type:            ContentTypeGame,
			Theme:           "driving",
			Title:           "Drift Boss",
			Description:     "One-button drifting - how far can you go?",
			ThumbnailURL:    "/assets/game-drift-boss.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-drift-boss",
		},
		{
			ID:              "game-tiny-fishing",
			Type:            ContentTypeGame,
			Theme:           "casual",
			Title:           "Tiny Fishing",
			Description:     "Relaxing fishing idle game - catch and upgrade",
			ThumbnailURL:    "/assets/game-tiny-fishing.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-tiny-fishing",
		},
		// AI Service
		{
			ID:              "ai-service-tech",
			Type:            ContentTypeAIService,
			Theme:           "tech",
			Title:           "AI Assistant",
			Description:     "Smart AI helper powered by OpenAI",
			ThumbnailURL:    "/assets/ai-service.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "ai-service",
		},
	}
}
