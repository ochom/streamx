package apps

import (
	"time"

	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/clients"
	"github.com/streamx/core/models"
	"github.com/streamx/core/utils"
)

var messages = make(chan *models.Message, 1000)

// broadcastMessage ...
func broadcastMessage(message *models.Message) {
	messages <- message
	logs.Info("new message added to the queue")
}

func RunConsumer() {
	logs.Info("Starting the consumer")
	go keepAlive()

	for message := range messages {
		logs.Info("sending message: %s", string(helpers.ToBytes(message)))

		// Create a pool ID
		poolID := utils.GetPoolID(message.InstanceID, message.ChannelID)

		// Send message to all clients in the pool
		clients := clients.GetClients(poolID)
		logs.Info("sending message to %d clients in pool: %s", len(clients), poolID)
		for _, client := range clients {
			client.AddMessage(message)
		}
	}
}

func keepAlive() {
	for {
		for _, poolID := range clients.GetPools() {
			instanceID, channelID := utils.GetPoolDetails(poolID)
			data := map[string]string{
				"time": time.Now().Format(time.RFC3339),
			}
			msg := models.NewMessage(instanceID, channelID, "keep-alive", string(helpers.ToBytes(data)))
			broadcastMessage(msg)
		}

		<-time.After(15 * time.Second)
	}
}
