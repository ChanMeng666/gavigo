package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                   string
	RedisURL               string
	LogLevel               string
	EngagementThresholdMS  int
	RecommendationThreshold float64
	PersonalScoreWeight    float64
	GlobalScoreWeight      float64
}

func Load() *Config {
	return &Config{
		Port:                   getEnv("PORT", "8080"),
		RedisURL:               getEnv("REDIS_URL", "redis://localhost:6379"),
		LogLevel:               getEnv("LOG_LEVEL", "info"),
		EngagementThresholdMS:  getEnvInt("ENGAGEMENT_THRESHOLD_MS", 10000),
		RecommendationThreshold: getEnvFloat("RECOMMENDATION_THRESHOLD", 0.6),
		PersonalScoreWeight:    getEnvFloat("PERSONAL_SCORE_WEIGHT", 0.6),
		GlobalScoreWeight:      getEnvFloat("GLOBAL_SCORE_WEIGHT", 0.4),
	}
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
