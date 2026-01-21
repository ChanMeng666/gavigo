package k8s

import (
	"log"
	"os"
	"path/filepath"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type Client struct {
	clientset *kubernetes.Clientset
	namespace string
}

func NewClient(namespace string) (*Client, error) {
	var config *rest.Config
	var err error

	// Try in-cluster config first (when running in K8s)
	config, err = rest.InClusterConfig()
	if err != nil {
		// Fall back to kubeconfig (for local development)
		kubeconfig := os.Getenv("KUBECONFIG")
		if kubeconfig == "" {
			home, _ := os.UserHomeDir()
			kubeconfig = filepath.Join(home, ".kube", "config")
		}

		config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			return nil, err
		}
		log.Println("Using kubeconfig for K8s client")
	} else {
		log.Println("Using in-cluster config for K8s client")
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return &Client{
		clientset: clientset,
		namespace: namespace,
	}, nil
}

func (c *Client) Clientset() *kubernetes.Clientset {
	return c.clientset
}

func (c *Client) Namespace() string {
	return c.namespace
}
