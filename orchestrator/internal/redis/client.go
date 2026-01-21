package redis

import (
	"log"
)

type Client struct {
	// Stub - Redis disabled for demo deployment
}

func NewClient(redisURL string) (*Client, error) {
	log.Println("Redis disabled - using in-memory state")
	return &Client{}, nil
}

func (c *Client) Close() error {
	return nil
}
