package services

import (
	"github.com/go-redis/redis/v8"
	"github.com/ochom/gutils/env"
)

var redisClient *redis.Client

// InitializeRedisClient initializes the Redis client with environment variables
func InitializeRedisClient() {
	redisClient = redis.NewClient(&redis.Options{
		Addr: env.Get("REDIS_URL", "localhost:6379"),
	})

	if err := redisClient.Ping(redisClient.Context()).Err(); err != nil {
		panic("failed to connect to Redis: " + err.Error())
	}
}

// GetRedisClient returns the Redis client instance
func GetRedisClient() *redis.Client {
	return redisClient
}
