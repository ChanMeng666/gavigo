package redis

import (
	"context"
	"crypto/tls"
	"log"
	"net/url"

	"github.com/redis/go-redis/v9"
)

type Client struct {
	rdb *redis.Client
}

func NewClient(redisURL string) (*Client, error) {
	// Parse Redis URL (supports both redis:// and rediss:// for TLS)
	u, err := url.Parse(redisURL)
	if err != nil {
		return nil, err
	}

	// Extract password from URL
	password := ""
	if u.User != nil {
		password, _ = u.User.Password()
	}

	// Configure TLS for rediss:// URLs
	var tlsConfig *tls.Config
	if u.Scheme == "rediss" {
		tlsConfig = &tls.Config{
			MinVersion: tls.VersionTLS12,
		}
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:      u.Host,
		Password:  password,
		DB:        0,
		TLSConfig: tlsConfig,
	})

	// Test connection
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, err
	}

	log.Printf("Connected to Redis at %s (TLS: %v)", u.Host, tlsConfig != nil)
	return &Client{rdb: rdb}, nil
}

func (c *Client) Close() error {
	return c.rdb.Close()
}

func (c *Client) Redis() *redis.Client {
	return c.rdb
}
