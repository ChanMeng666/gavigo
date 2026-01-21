package k8s

import (
	"context"
	"time"
)

type PodPhase string

const (
	PodPending   PodPhase = "Pending"
	PodRunning   PodPhase = "Running"
	PodSucceeded PodPhase = "Succeeded"
	PodFailed    PodPhase = "Failed"
	PodUnknown   PodPhase = "Unknown"
)

type PodStatus struct {
	DeploymentName string
	PodName        string
	Phase          PodPhase
	Ready          bool
	Timestamp      time.Time
}

type PodStatusCallback func(status PodStatus)

// WatchPods is a stub
func (c *Client) WatchPods(ctx context.Context, callback PodStatusCallback) error {
	// No-op in demo mode
	<-ctx.Done()
	return ctx.Err()
}

// GetAllPodStatuses is a stub
func (c *Client) GetAllPodStatuses(ctx context.Context) ([]PodStatus, error) {
	return []PodStatus{}, nil
}
