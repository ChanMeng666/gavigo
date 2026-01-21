package redis

import (
	"context"
	"encoding/json"
	"log"

	"github.com/redis/go-redis/v9"
)

const (
	ChannelDecisions       = "gavigo:decisions"
	ChannelContainerStates = "gavigo:container_states"
	ChannelScoreUpdates    = "gavigo:score_updates"
)

// Publish publishes an event to a channel
func (c *Client) Publish(ctx context.Context, channel string, message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return err
	}
	return c.rdb.Publish(ctx, channel, data).Err()
}

// Subscribe subscribes to channels and returns a channel for messages
func (c *Client) Subscribe(ctx context.Context, channels ...string) *redis.PubSub {
	return c.rdb.Subscribe(ctx, channels...)
}

// PublishDecision publishes a decision event
func (c *Client) PublishDecision(ctx context.Context, decision interface{}) error {
	return c.Publish(ctx, ChannelDecisions, decision)
}

// PublishContainerState publishes a container state change event
func (c *Client) PublishContainerState(ctx context.Context, event interface{}) error {
	return c.Publish(ctx, ChannelContainerStates, event)
}

// PublishScoreUpdate publishes a score update event
func (c *Client) PublishScoreUpdate(ctx context.Context, event interface{}) error {
	return c.Publish(ctx, ChannelScoreUpdates, event)
}

// StartSubscriber starts a subscriber that forwards messages to a callback
func (c *Client) StartSubscriber(ctx context.Context, callback func(channel string, payload []byte)) {
	pubsub := c.Subscribe(ctx, ChannelDecisions, ChannelContainerStates, ChannelScoreUpdates)
	defer pubsub.Close()

	ch := pubsub.Channel()
	for {
		select {
		case <-ctx.Done():
			return
		case msg := <-ch:
			if msg != nil {
				callback(msg.Channel, []byte(msg.Payload))
			}
		}
	}
}

// LogSubscriber is a simple subscriber that logs messages (for debugging)
func (c *Client) LogSubscriber(ctx context.Context) {
	c.StartSubscriber(ctx, func(channel string, payload []byte) {
		log.Printf("[PubSub] Channel: %s, Payload: %s", channel, string(payload))
	})
}
