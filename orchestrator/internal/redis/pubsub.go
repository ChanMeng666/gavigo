package redis

import (
	"context"
)

const (
	ChannelDecisions       = "gavigo:decisions"
	ChannelContainerStates = "gavigo:container_states"
	ChannelScoreUpdates    = "gavigo:score_updates"
)

// Publish is a stub - Redis disabled for demo deployment
func (c *Client) Publish(ctx context.Context, channel string, message interface{}) error {
	return nil
}

// PublishDecision is a stub
func (c *Client) PublishDecision(ctx context.Context, decision interface{}) error {
	return nil
}

// PublishContainerState is a stub
func (c *Client) PublishContainerState(ctx context.Context, event interface{}) error {
	return nil
}

// PublishScoreUpdate is a stub
func (c *Client) PublishScoreUpdate(ctx context.Context, event interface{}) error {
	return nil
}

// StartSubscriber is a stub
func (c *Client) StartSubscriber(ctx context.Context, callback func(channel string, payload []byte)) {
	// No-op
}

// LogSubscriber is a stub
func (c *Client) LogSubscriber(ctx context.Context) {
	// No-op
}
