package k8s

import (
	"context"
	"log"
)

// ScaleDeployment is a stub
func (c *Client) ScaleDeployment(ctx context.Context, deploymentName string, replicas int32) error {
	log.Printf("[Simulated] Scaled deployment %s to %d replicas", deploymentName, replicas)
	return nil
}

// GetDeploymentReplicas is a stub
func (c *Client) GetDeploymentReplicas(ctx context.Context, deploymentName string) (int32, int32, error) {
	return 0, 0, nil
}

// ScaleToWarm is a stub
func (c *Client) ScaleToWarm(ctx context.Context, deploymentName string) error {
	return c.ScaleDeployment(ctx, deploymentName, 1)
}

// ScaleToCold is a stub
func (c *Client) ScaleToCold(ctx context.Context, deploymentName string) error {
	return c.ScaleDeployment(ctx, deploymentName, 0)
}

// IsDeploymentReady is a stub
func (c *Client) IsDeploymentReady(ctx context.Context, deploymentName string) (bool, error) {
	return true, nil
}

// ScaleAllToCold is a stub
func (c *Client) ScaleAllToCold(ctx context.Context, deploymentNames []string) error {
	for _, name := range deploymentNames {
		if err := c.ScaleToCold(ctx, name); err != nil {
			log.Printf("Warning: failed to scale %s to cold: %v", name, err)
		}
	}
	return nil
}
