package redis

import (
	"context"

	"github.com/gavigo/orchestrator/internal/models"
)

const (
	trendKeyPrefix     = "trend:"
	contentKeyPrefix   = "content:"
	sessionKeyPrefix   = "session:"
	decisionsKey       = "decisions:recent"
	maxRecentDecisions = 50
)

// SetTrendScore is a stub
func (c *Client) SetTrendScore(ctx context.Context, score *models.TrendScore) error {
	return nil
}

// GetTrendScore is a stub
func (c *Client) GetTrendScore(ctx context.Context, contentID string) (*models.TrendScore, error) {
	return nil, nil
}

// GetAllTrendScores is a stub
func (c *Client) GetAllTrendScores(ctx context.Context) (map[string]*models.TrendScore, error) {
	return make(map[string]*models.TrendScore), nil
}

// SetContentStatus is a stub
func (c *Client) SetContentStatus(ctx context.Context, contentID string, status models.ContainerStatus) error {
	return nil
}

// GetContentStatus is a stub
func (c *Client) GetContentStatus(ctx context.Context, contentID string) (models.ContainerStatus, error) {
	return models.StatusCold, nil
}

// SetPersonalScore is a stub
func (c *Client) SetPersonalScore(ctx context.Context, sessionID, contentID string, score float64) error {
	return nil
}

// GetPersonalScore is a stub
func (c *Client) GetPersonalScore(ctx context.Context, sessionID, contentID string) (float64, error) {
	return 0, nil
}

// AddDecision is a stub
func (c *Client) AddDecision(ctx context.Context, decision *models.AIDecision) error {
	return nil
}

// GetRecentDecisions is a stub
func (c *Client) GetRecentDecisions(ctx context.Context, limit int) ([]*models.AIDecision, error) {
	return []*models.AIDecision{}, nil
}

// ClearAllData is a stub
func (c *Client) ClearAllData(ctx context.Context) error {
	return nil
}

// InitializeDefaultScores is a stub
func (c *Client) InitializeDefaultScores(ctx context.Context, content []models.ContentItem) error {
	return nil
}
