package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/gavigo/orchestrator/internal/models"
)

const (
	trendKeyPrefix    = "trend:"
	contentKeyPrefix  = "content:"
	sessionKeyPrefix  = "session:"
	decisionsKey      = "decisions:recent"
	maxRecentDecisions = 50
)

// SetTrendScore stores a trend score for content
func (c *Client) SetTrendScore(ctx context.Context, score *models.TrendScore) error {
	key := trendKeyPrefix + score.ContentID
	data, err := json.Marshal(score)
	if err != nil {
		return err
	}
	return c.rdb.Set(ctx, key, data, 0).Err()
}

// GetTrendScore retrieves a trend score for content
func (c *Client) GetTrendScore(ctx context.Context, contentID string) (*models.TrendScore, error) {
	key := trendKeyPrefix + contentID
	data, err := c.rdb.Get(ctx, key).Bytes()
	if err != nil {
		return nil, err
	}

	var score models.TrendScore
	if err := json.Unmarshal(data, &score); err != nil {
		return nil, err
	}
	return &score, nil
}

// GetAllTrendScores retrieves all trend scores
func (c *Client) GetAllTrendScores(ctx context.Context) (map[string]*models.TrendScore, error) {
	keys, err := c.rdb.Keys(ctx, trendKeyPrefix+"*").Result()
	if err != nil {
		return nil, err
	}

	scores := make(map[string]*models.TrendScore)
	for _, key := range keys {
		contentID := key[len(trendKeyPrefix):]
		score, err := c.GetTrendScore(ctx, contentID)
		if err == nil {
			scores[contentID] = score
		}
	}
	return scores, nil
}

// SetContentStatus stores content status
func (c *Client) SetContentStatus(ctx context.Context, contentID string, status models.ContainerStatus) error {
	key := contentKeyPrefix + contentID + ":status"
	return c.rdb.Set(ctx, key, string(status), 0).Err()
}

// GetContentStatus retrieves content status
func (c *Client) GetContentStatus(ctx context.Context, contentID string) (models.ContainerStatus, error) {
	key := contentKeyPrefix + contentID + ":status"
	status, err := c.rdb.Get(ctx, key).Result()
	if err != nil {
		return models.StatusCold, err
	}
	return models.ContainerStatus(status), nil
}

// SetPersonalScore stores personal score for content
func (c *Client) SetPersonalScore(ctx context.Context, sessionID, contentID string, score float64) error {
	key := fmt.Sprintf("%s%s:personal:%s", sessionKeyPrefix, sessionID, contentID)
	return c.rdb.Set(ctx, key, score, time.Hour).Err() // 1 hour TTL for session data
}

// GetPersonalScore retrieves personal score for content
func (c *Client) GetPersonalScore(ctx context.Context, sessionID, contentID string) (float64, error) {
	key := fmt.Sprintf("%s%s:personal:%s", sessionKeyPrefix, sessionID, contentID)
	return c.rdb.Get(ctx, key).Float64()
}

// AddDecision adds a decision to the recent decisions list
func (c *Client) AddDecision(ctx context.Context, decision *models.AIDecision) error {
	data, err := json.Marshal(decision)
	if err != nil {
		return err
	}

	// Push to list and trim to max size
	pipe := c.rdb.Pipeline()
	pipe.LPush(ctx, decisionsKey, data)
	pipe.LTrim(ctx, decisionsKey, 0, maxRecentDecisions-1)
	_, err = pipe.Exec(ctx)
	return err
}

// GetRecentDecisions retrieves recent decisions
func (c *Client) GetRecentDecisions(ctx context.Context, limit int) ([]*models.AIDecision, error) {
	if limit <= 0 || limit > maxRecentDecisions {
		limit = maxRecentDecisions
	}

	data, err := c.rdb.LRange(ctx, decisionsKey, 0, int64(limit-1)).Result()
	if err != nil {
		return nil, err
	}

	decisions := make([]*models.AIDecision, 0, len(data))
	for _, d := range data {
		var decision models.AIDecision
		if err := json.Unmarshal([]byte(d), &decision); err == nil {
			decisions = append(decisions, &decision)
		}
	}
	return decisions, nil
}

// ClearAllData clears all Redis data (for demo reset)
func (c *Client) ClearAllData(ctx context.Context) error {
	return c.rdb.FlushDB(ctx).Err()
}

// InitializeDefaultScores initializes trend scores for all content
func (c *Client) InitializeDefaultScores(ctx context.Context, content []models.ContentItem) error {
	for _, item := range content {
		score := &models.TrendScore{
			ContentID:      item.ID,
			ViralScore:     0.1, // Low initial score
			TrendDirection: "STABLE",
			LastUpdated:    time.Now(),
			ManualOverride: false,
		}
		if err := c.SetTrendScore(ctx, score); err != nil {
			return err
		}
		if err := c.SetContentStatus(ctx, item.ID, models.StatusCold); err != nil {
			return err
		}
	}
	return nil
}
