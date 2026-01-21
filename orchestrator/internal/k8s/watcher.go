package k8s

import (
	"context"
	"log"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/watch"
)

type PodStatus struct {
	DeploymentName string
	PodName        string
	Phase          corev1.PodPhase
	Ready          bool
	Timestamp      time.Time
}

type PodStatusCallback func(status PodStatus)

// WatchPods watches pods in the namespace and calls the callback on changes
func (c *Client) WatchPods(ctx context.Context, callback PodStatusCallback) error {
	podsClient := c.clientset.CoreV1().Pods(c.namespace)

	watcher, err := podsClient.Watch(ctx, metav1.ListOptions{
		LabelSelector: "type=workload", // Only watch workload pods
	})
	if err != nil {
		return err
	}
	defer watcher.Stop()

	log.Println("Started watching pods in namespace:", c.namespace)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case event, ok := <-watcher.ResultChan():
			if !ok {
				log.Println("Pod watcher channel closed, restarting...")
				return c.WatchPods(ctx, callback) // Restart watcher
			}

			if event.Type == watch.Error {
				log.Printf("Watch error: %v", event.Object)
				continue
			}

			pod, ok := event.Object.(*corev1.Pod)
			if !ok {
				continue
			}

			// Extract deployment name from labels
			deploymentName := pod.Labels["app"]
			if deploymentName == "" {
				continue
			}

			// Check if pod is ready
			ready := false
			for _, condition := range pod.Status.Conditions {
				if condition.Type == corev1.PodReady && condition.Status == corev1.ConditionTrue {
					ready = true
					break
				}
			}

			status := PodStatus{
				DeploymentName: deploymentName,
				PodName:        pod.Name,
				Phase:          pod.Status.Phase,
				Ready:          ready,
				Timestamp:      time.Now(),
			}

			callback(status)
		}
	}
}

// GetAllPodStatuses returns the current status of all workload pods
func (c *Client) GetAllPodStatuses(ctx context.Context) ([]PodStatus, error) {
	podsClient := c.clientset.CoreV1().Pods(c.namespace)

	pods, err := podsClient.List(ctx, metav1.ListOptions{
		LabelSelector: "type=workload",
	})
	if err != nil {
		return nil, err
	}

	statuses := make([]PodStatus, 0, len(pods.Items))
	for _, pod := range pods.Items {
		deploymentName := pod.Labels["app"]
		if deploymentName == "" {
			continue
		}

		ready := false
		for _, condition := range pod.Status.Conditions {
			if condition.Type == corev1.PodReady && condition.Status == corev1.ConditionTrue {
				ready = true
				break
			}
		}

		statuses = append(statuses, PodStatus{
			DeploymentName: deploymentName,
			PodName:        pod.Name,
			Phase:          pod.Status.Phase,
			Ready:          ready,
			Timestamp:      time.Now(),
		})
	}

	return statuses, nil
}
