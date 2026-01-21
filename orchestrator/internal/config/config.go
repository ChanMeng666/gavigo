package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                    string
	RedisURL                string
	RedisPassword           string
	LogLevel                string
	K8sEnabled              bool
	K8sNamespace            string
	EngagementThresholdMS   int
	RecommendationThreshold float64
	PersonalScoreWeight     float64
	GlobalScoreWeight       float64
}

func Load() *Config {
	return &Config{
		Port:                    getEnv("PORT", "8080"),
		RedisURL:                getEnv("REDIS_URL", "localhost:6379"),
		RedisPassword:           getEnv("REDIS_PASSWORD", ""),
		LogLevel:                getEnv("LOG_LEVEL", "info"),
		K8sEnabled:              getEnvBool("K8S_ENABLED", false),
		K8sNamespace:            getEnv("K8S_NAMESPACE", "gavigo"),
		EngagementThresholdMS:   getEnvInt("ENGAGEMENT_THRESHOLD_MS", 10000),
		RecommendationThreshold: getEnvFloat("RECOMMENDATION_THRESHOLD", 0.6),
		PersonalScoreWeight:     getEnvFloat("PERSONAL_SCORE_WEIGHT", 0.6),
		GlobalScoreWeight:       getEnvFloat("GLOBAL_SCORE_WEIGHT", 0.4),
	}
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return value == "true" || value == "1" || value == "yes"
	}
	return defaultValue
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvFloat(key string, defaultValue float64) float64 {
	if value := os.Getenv(key); value != "" {
		if floatVal, err := strconv.ParseFloat(value, 64); err == nil {
			return floatVal
		}
	}
	return defaultValue
}
