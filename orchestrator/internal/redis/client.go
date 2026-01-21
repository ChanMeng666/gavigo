package redis

import (
	"context"
	"log"
	"strings"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	rdb *redis.Client
}

func NewClient(redisURL string) (*Client, error) {
	// Parse Redis URL (redis://host:port)
	addr := strings.TrimPrefix(redisURL, "redis://")

	rdb := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: "", // no password for demo
		DB:       0,
	})

	// Test connection
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	log.Printf("Connected to Redis at %s", addr)
	return &Client{rdb: rdb}, nil
}

func (c *Client) Close() error {
	return c.rdb.Close()
}

func (c *Client) Redis() *redis.Client {
	return c.rdb
}
