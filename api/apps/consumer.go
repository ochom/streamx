package apps

import (
	"fmt"
	"os"
	"time"

	"github.com/ochom/gutils/env"
	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/pubsub"
	"github.com/ochom/gutils/uuid"
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

	hostName, _ := os.Hostname()
	if hostName == "" {
		hostName = uuid.New()
	}

	queueName := fmt.Sprintf("streamx-queue-%s", hostName)

	logs.Info("[x] running rabbit mq consumers")
	for i := 0; i < 10; i++ {
		go func(worker int) {
			consumer := pubsub.NewConsumer(rabbitUrl, queueName)
			consumer.SetExchangeName("STREAMX_EXCHANGE")
			consumer.SetConnectionName("streamx-consumer")
			consumer.SetTag(fmt.Sprintf("streamx-consumer-%s-%d", queueName, worker))
			consumer.SetDeleteWhenUnused(true)

			err := consumer.Consume(func(b []byte) {
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
		for _, client := range clients.GetClients() {
			instanceID, channelID := utils.GetPoolDetails(client.GetPoolID())
			data := map[string]string{
				"time": time.Now().Format(time.RFC3339),
			}

			msg := models.NewMessage(instanceID, channelID, "keep-alive", string(helpers.ToBytes(data)))
			client.AddMessage(msg)
		}

		<-time.After(15 * time.Second)
	}
}

// sendMessage Send message to all clients in the pool
func sendMessage(poolID string, message *models.Message) {
	clientList := clients.GetClientsByPoolID(poolID)
	if len(clientList) == 0 {
		clients.DeleteChannel(poolID)
	}

	for _, client := range clientList {
		client.AddMessage(message)
	}

	logs.Info("sending message ==> pool: %s, clients: %d", poolID, len(clientList))
}
