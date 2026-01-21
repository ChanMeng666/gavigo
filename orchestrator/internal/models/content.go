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
	"football": "game-football",
	"scifi":    "game-scifi",
	"tech":     "ai-service-tech",
}

// DefaultContent returns the initial content items for the demo
func DefaultContent() []ContentItem {
	return []ContentItem{
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
			ID:              "game-football",
			Type:            ContentTypeGame,
			Theme:           "football",
			Title:           "Football Game",
			Description:     "Interactive football experience",
			ThumbnailURL:    "/assets/game-football.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-football",
		},
		{
			ID:              "game-scifi",
			Type:            ContentTypeGame,
			Theme:           "scifi",
			Title:           "Space Adventure",
			Description:     "Explore the galaxy",
			ThumbnailURL:    "/assets/game-scifi.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "game-scifi",
		},
		{
			ID:              "ai-service-tech",
			Type:            ContentTypeAIService,
			Theme:           "tech",
			Title:           "AI Assistant",
			Description:     "Smart AI helper",
			ThumbnailURL:    "/assets/ai-service.png",
			ContainerStatus: StatusCold,
			DeploymentName:  "ai-service",
		},
	}
}
