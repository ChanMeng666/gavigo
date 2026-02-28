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
	"game-2048":           "game-slice-master",
	"game-slice-master":   "game-tiny-fishing",
	"game-space-waves":    "game-drift-boss",
	"game-drift-boss":     "game-space-waves",
	"game-tiny-fishing":   "game-slice-master",
	"game-stickman-hook":  "game-temple-of-boom",
	"game-moto-x3m":       "game-smash-karts",
	"game-paper-io-2":     "game-narrow-one",
	"game-temple-of-boom": "game-stickman-hook",
	"game-monkey-mart":    "game-tiny-fishing",
	"game-tunnel-rush":    "game-space-waves",
	"game-narrow-one":     "game-paper-io-2",
	"game-smash-karts":    "game-moto-x3m",
	"ai-service-tech":     "game-monkey-mart",
}

// DefaultContent returns the initial content items for the demo
func DefaultContent() []ContentItem {
	return []ContentItem{
		// CrazyGames
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
		{
			ID:              "game-stickman-hook",
			Type:            ContentTypeGame,
			Theme:           "physics",
			Title:           "Stickman Hook",
			Description:     "Swing through levels with grappling physics",
			ThumbnailURL:    "/assets/game-stickman-hook.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-stickman-hook",
		},
		{
			ID:              "game-moto-x3m",
			Type:            ContentTypeGame,
			Theme:           "racing",
			Title:           "Moto X3M",
			Description:     "Extreme motorcycle racing with stunts",
			ThumbnailURL:    "/assets/game-moto-x3m.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-moto-x3m",
		},
		{
			ID:              "game-paper-io-2",
			Type:            ContentTypeGame,
			Theme:           "territory",
			Title:           "Paper.io 2",
			Description:     "Claim territory in this multiplayer arena",
			ThumbnailURL:    "/assets/game-paper-io-2.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-paper-io-2",
		},
		{
			ID:              "game-temple-of-boom",
			Type:            ContentTypeGame,
			Theme:           "action",
			Title:           "Temple of Boom",
			Description:     "Run and gun through temple dungeons",
			ThumbnailURL:    "/assets/game-temple-of-boom.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-temple-of-boom",
		},
		{
			ID:              "game-monkey-mart",
			Type:            ContentTypeGame,
			Theme:           "idle",
			Title:           "Monkey Mart",
			Description:     "Run your own supermarket as a monkey",
			ThumbnailURL:    "/assets/game-monkey-mart.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-monkey-mart",
		},
		{
			ID:              "game-tunnel-rush",
			Type:            ContentTypeGame,
			Theme:           "arcade",
			Title:           "Tunnel Rush",
			Description:     "Dodge obstacles in a high-speed tunnel",
			ThumbnailURL:    "/assets/game-tunnel-rush.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-tunnel-rush",
		},
		{
			ID:              "game-narrow-one",
			Type:            ContentTypeGame,
			Theme:           "archery",
			Title:           "Narrow One",
			Description:     "Multiplayer archery capture-the-flag",
			ThumbnailURL:    "/assets/game-narrow-one.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-narrow-one",
		},
		{
			ID:              "game-smash-karts",
			Type:            ContentTypeGame,
			Theme:           "racing",
			Title:           "Smash Karts",
			Description:     "3D multiplayer kart battle arena",
			ThumbnailURL:    "/assets/game-smash-karts.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-smash-karts",
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
