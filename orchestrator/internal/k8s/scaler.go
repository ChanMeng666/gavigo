package k8s

import (
	"context"
	"fmt"
	"log"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ScaleDeployment scales a deployment to the specified number of replicas
func (c *Client) ScaleDeployment(ctx context.Context, deploymentName string, replicas int32) error {
	deploymentsClient := c.clientset.AppsV1().Deployments(c.namespace)

	// Get current deployment
	deployment, err := deploymentsClient.Get(ctx, deploymentName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get deployment %s: %w", deploymentName, err)
	}

	// Update replicas
	deployment.Spec.Replicas = &replicas

	// Apply update
	_, err = deploymentsClient.Update(ctx, deployment, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("failed to scale deployment %s: %w", deploymentName, err)
	}

	log.Printf("Scaled deployment %s to %d replicas", deploymentName, replicas)
	return nil
}

// GetDeploymentReplicas returns the current replica count for a deployment
func (c *Client) GetDeploymentReplicas(ctx context.Context, deploymentName string) (int32, int32, error) {
	deploymentsClient := c.clientset.AppsV1().Deployments(c.namespace)

	deployment, err := deploymentsClient.Get(ctx, deploymentName, metav1.GetOptions{})
	if err != nil {
		return 0, 0, fmt.Errorf("failed to get deployment %s: %w", deploymentName, err)
	}

	desired := int32(0)
	if deployment.Spec.Replicas != nil {
		desired = *deployment.Spec.Replicas
	}
	ready := deployment.Status.ReadyReplicas

	return desired, ready, nil
}

// ScaleToWarm scales a deployment to 1 replica (WARM state)
func (c *Client) ScaleToWarm(ctx context.Context, deploymentName string) error {
	return c.ScaleDeployment(ctx, deploymentName, 1)
}

// ScaleToCold scales a deployment to 0 replicas (COLD state)
func (c *Client) ScaleToCold(ctx context.Context, deploymentName string) error {
	return c.ScaleDeployment(ctx, deploymentName, 0)
}

// IsDeploymentReady checks if a deployment has ready replicas
func (c *Client) IsDeploymentReady(ctx context.Context, deploymentName string) (bool, error) {
	desired, ready, err := c.GetDeploymentReplicas(ctx, deploymentName)
	if err != nil {
		return false, err
	}
	return desired > 0 && ready >= desired, nil
}

// ScaleAllToCold scales all workload deployments to 0 replicas
func (c *Client) ScaleAllToCold(ctx context.Context, deploymentNames []string) error {
	for _, name := range deploymentNames {
		if err := c.ScaleToCold(ctx, name); err != nil {
			log.Printf("Warning: failed to scale %s to cold: %v", name, err)
		}
	}
	return nil
}
