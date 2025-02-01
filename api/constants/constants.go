package constants

import "github.com/ochom/gutils/env"

var (
	RabbitUrl = env.Get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
)
