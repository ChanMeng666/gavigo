package models

type ContentType string

const (
	ContentTypeGame      ContentType = "GAME"
	ContentTypeAIService ContentType = "AI_SERVICE"
	ContentTypeVideo     ContentType = "VIDEO"
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

// CrossDomainRelation maps video themes to related game content
var CrossDomainRelations = map[string]string{
	"football": "game-clicker-heroes",
	"scifi":    "game-mrmine",
	"tech":     "ai-service-tech",
}

// DefaultContent returns the initial content items for the demo
func DefaultContent() []ContentItem {
	return []ContentItem{
		// Videos
		{
			ID:              "video-football-1",
			Type:            ContentTypeVideo,
			Theme:           "football",
			Title:           "Football Highlights",
			Description:     "Amazing football moments",
			ThumbnailURL:    "/assets/video-football-1.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "video-server",
		},
		{
			ID:              "video-football-2",
			Type:            ContentTypeVideo,
			Theme:           "football",
			Title:           "Top Goals 2024",
			Description:     "Best goals of the season",
			ThumbnailURL:    "/assets/video-football-2.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "video-server",
		},
		{
			ID:              "video-scifi-1",
			Type:            ContentTypeVideo,
			Theme:           "scifi",
			Title:           "Space Documentary",
			Description:     "Exploring the cosmos",
			ThumbnailURL:    "/assets/video-scifi-1.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "video-server",
		},
		{
			ID:              "video-scifi-2",
			Type:            ContentTypeVideo,
			Theme:           "scifi",
			Title:           "Deep Space Journey",
			Description:     "Venturing into the unknown",
			ThumbnailURL:    "/assets/video-scifi-2.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "video-server",
		},
		{
			ID:              "video-football-3",
			Type:            ContentTypeVideo,
			Theme:           "football",
			Title:           "Championship Finals",
			Description:     "The ultimate showdown",
			ThumbnailURL:    "/assets/video-football-3.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "video-server",
		},
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
