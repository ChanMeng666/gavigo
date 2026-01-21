package k8s

import (
	"log"
)

type Client struct {
	namespace string
}

func NewClient(namespace string) (*Client, error) {
	log.Println("K8s disabled - using simulated container states")
	return &Client{
		namespace: namespace,
	}, nil
}

func (c *Client) Namespace() string {
	return c.namespace
}
