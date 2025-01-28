package apps

import (
	"fmt"
	"time"

	"github.com/ochom/gutils/env"
	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/pubsub"
	"github.com/streamx/core/clients"
	"github.com/streamx/core/models"
	"github.com/streamx/core/utils"
)

var (
	rabbitUrl = env.Get("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
)

// RunRabbitMQConsumer  consumes messages from rabbit mq
func RunRabbitMQConsumer() {
	go keepAlive()

	logs.Info("running rabbitmq consumer")
	for i := 0; i < 10; i++ {
		go func(worker int) {
			consumer := pubsub.NewConsumer(rabbitUrl, "streamx-queue")
			consumer.SetExchangeName("STREAMX_EXCHANGE")
			consumer.SetConnectionName("streamx-consumer")
			consumer.SetTag(fmt.Sprintf("streamx-consumer-%d", worker))
			consumer.SetDeleteWhenUnused(true)

			err := consumer.Consume(func(b []byte) {
				logs.Info("received message: %s", string(b))
				message := helpers.FromBytes[models.Message](b)
				poolID := utils.GetPoolID(message.InstanceID, message.Channel)
				sendMessage(poolID, &message)
			})

			if err != nil {
				logs.Error("failed to consume message: %s", err.Error())
			}
		}(i)
	}
}

// keepAlive ...
func keepAlive() {
	for {
		for _, poolID := range clients.GetPools() {
			instanceID, channelID := utils.GetPoolDetails(poolID)
			data := map[string]string{
				"time": time.Now().Format(time.RFC3339),
			}

			msg := models.NewMessage(instanceID, channelID, "keep-alive", string(helpers.ToBytes(data)))
			sendMessage(poolID, msg)
		}

		<-time.After(15 * time.Second)
	}
}

// sendMessage Send message to all clients in the pool
func sendMessage(poolID string, message *models.Message) {
	clients := clients.GetClients(poolID)
	for _, client := range clients {
		client.AddMessage(message)
	}

	logs.Info("sending message clients ==> pool: %s, clients: %d", poolID, len(clients))
}
