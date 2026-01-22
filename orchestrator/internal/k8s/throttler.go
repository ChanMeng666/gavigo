package k8s

import (
	"context"
	"fmt"
	"log"
	"sync"

	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/resource"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ResourceConfig holds CPU and memory resource settings
type ResourceConfig struct {
	CPURequest    string
	CPULimit      string
	MemoryRequest string
	MemoryLimit   string
}

// ThrottleConfig defines throttling levels for different modes
type ThrottleConfig struct {
	// Full resources for active (foreground) containers
	ActiveResources ResourceConfig
	// Reduced resources for warm (standby) containers
	WarmResources ResourceConfig
	// Minimal resources for background (throttled) containers
	BackgroundResources ResourceConfig
}

// DefaultThrottleConfig returns the default throttling configuration
func DefaultThrottleConfig() ThrottleConfig {
	return ThrottleConfig{
		ActiveResources: ResourceConfig{
			CPURequest:    "200m",
			CPULimit:      "1000m",
			MemoryRequest: "256Mi",
			MemoryLimit:   "512Mi",
		},
		WarmResources: ResourceConfig{
			CPURequest:    "100m",
			CPULimit:      "500m",
			MemoryRequest: "128Mi",
			MemoryLimit:   "256Mi",
		},
		BackgroundResources: ResourceConfig{
			CPURequest:    "50m",
			CPULimit:      "100m",
			MemoryRequest: "64Mi",
			MemoryLimit:   "128Mi",
		},
	}
}

// Throttler manages resource throttling for deployments
type Throttler struct {
	client         *Client
	config         ThrottleConfig
	originalLimits map[string]ResourceConfig
	mu             sync.RWMutex
}

// NewThrottler creates a new throttler instance
func NewThrottler(client *Client, config ThrottleConfig) *Throttler {
	return &Throttler{
		client:         client,
		config:         config,
		originalLimits: make(map[string]ResourceConfig),
	}
}

// ThrottleDeployment reduces resources for a specific deployment
func (t *Throttler) ThrottleDeployment(ctx context.Context, deploymentName string, level string) error {
	var config ResourceConfig
	switch level {
	case "active":
		config = t.config.ActiveResources
	case "warm":
		config = t.config.WarmResources
	case "background":
		config = t.config.BackgroundResources
	default:
		return fmt.Errorf("unknown throttle level: %s", level)
	}

	return t.applyResourceConfig(ctx, deploymentName, config)
}

// ThrottleForForeground throttles all background workloads when a foreground app is activated
// activeDeployment: the deployment that should get full resources
// allDeployments: all workload deployments to manage
func (t *Throttler) ThrottleForForeground(ctx context.Context, activeDeployment string, allDeployments []string) error {
	log.Printf("Throttling for foreground activation: %s", activeDeployment)

	for _, deployment := range allDeployments {
		var level string
		if deployment == activeDeployment {
			level = "active"
		} else {
			// Check if deployment has replicas running
			desired, _, err := t.client.GetDeploymentReplicas(ctx, deployment)
			if err != nil {
				log.Printf("Warning: failed to get replicas for %s: %v", deployment, err)
				continue
			}
			if desired > 0 {
				level = "background"
			} else {
				continue // Skip COLD deployments
			}
		}

		if err := t.ThrottleDeployment(ctx, deployment, level); err != nil {
			log.Printf("Warning: failed to throttle %s to %s: %v", deployment, level, err)
		}
	}

	return nil
}

// RestoreResources restores resources when returning to mixed browsing mode
func (t *Throttler) RestoreResources(ctx context.Context, deployments []string) error {
	log.Println("Restoring resources for mixed browsing mode")

	for _, deployment := range deployments {
		desired, _, err := t.client.GetDeploymentReplicas(ctx, deployment)
		if err != nil {
			log.Printf("Warning: failed to get replicas for %s: %v", deployment, err)
			continue
		}

		if desired > 0 {
			// Restore to warm resources for running deployments
			if err := t.ThrottleDeployment(ctx, deployment, "warm"); err != nil {
				log.Printf("Warning: failed to restore %s: %v", deployment, err)
			}
		}
	}

	return nil
}

// applyResourceConfig applies resource limits to a deployment
func (t *Throttler) applyResourceConfig(ctx context.Context, deploymentName string, config ResourceConfig) error {
	deploymentsClient := t.client.clientset.AppsV1().Deployments(t.client.namespace)

	deployment, err := deploymentsClient.Get(ctx, deploymentName, metav1.GetOptions{})
	if err != nil {
		return fmt.Errorf("failed to get deployment %s: %w", deploymentName, err)
	}

	// Store original limits if not already stored
	t.mu.Lock()
	if _, exists := t.originalLimits[deploymentName]; !exists && len(deployment.Spec.Template.Spec.Containers) > 0 {
		container := deployment.Spec.Template.Spec.Containers[0]
		t.originalLimits[deploymentName] = ResourceConfig{
			CPURequest:    container.Resources.Requests.Cpu().String(),
			CPULimit:      container.Resources.Limits.Cpu().String(),
			MemoryRequest: container.Resources.Requests.Memory().String(),
			MemoryLimit:   container.Resources.Limits.Memory().String(),
		}
	}
	t.mu.Unlock()

	// Update container resources
	if len(deployment.Spec.Template.Spec.Containers) > 0 {
		deployment.Spec.Template.Spec.Containers[0].Resources = corev1.ResourceRequirements{
			Requests: corev1.ResourceList{
				corev1.ResourceCPU:    resource.MustParse(config.CPURequest),
				corev1.ResourceMemory: resource.MustParse(config.MemoryRequest),
			},
			Limits: corev1.ResourceList{
				corev1.ResourceCPU:    resource.MustParse(config.CPULimit),
				corev1.ResourceMemory: resource.MustParse(config.MemoryLimit),
			},
		}
	}

	_, err = deploymentsClient.Update(ctx, deployment, metav1.UpdateOptions{})
	if err != nil {
		return fmt.Errorf("failed to update deployment %s resources: %w", deploymentName, err)
	}

	log.Printf("Applied resource config to %s: CPU=%s/%s Memory=%s/%s",
		deploymentName, config.CPURequest, config.CPULimit, config.MemoryRequest, config.MemoryLimit)
	return nil
}

// GetOriginalLimits returns the original resource limits for a deployment
func (t *Throttler) GetOriginalLimits(deploymentName string) (ResourceConfig, bool) {
	t.mu.RLock()
	defer t.mu.RUnlock()
	config, exists := t.originalLimits[deploymentName]
	return config, exists
}

// RestoreOriginalLimits restores the original resource limits for a deployment
func (t *Throttler) RestoreOriginalLimits(ctx context.Context, deploymentName string) error {
	t.mu.RLock()
	config, exists := t.originalLimits[deploymentName]
	t.mu.RUnlock()

	if !exists {
		return fmt.Errorf("no original limits stored for %s", deploymentName)
	}

	return t.applyResourceConfig(ctx, deploymentName, config)
}
