package apps

import (
	"context"
	"time"

	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/apps/dto"
	"github.com/streamx/core/clients"
	"github.com/streamx/core/constants"
	"github.com/streamx/core/services"
)

// RunConsumers  consumes messages from a pubsub
func RunConsumers() {

	go keepAlive()

	logs.Info("[x] running consumers")

	ctx := context.Background()
	client := services.GetRedisClient()
	subscription := client.Subscribe(ctx, constants.PubSubChannelName)

	for {
		msg, err := subscription.ReceiveMessage(ctx)
		if err != nil {
			logs.Fatal("failed to receive message: %s", err.Error())
			continue
		}

		message := helpers.FromBytes[dto.Message]([]byte(msg.Payload))
		sendMessage(message.Channel, &message)
	}
}

// keepAlive ...
func keepAlive() {
	tick := time.NewTicker(30 * time.Second)
	for range tick.C {
		for _, client := range clients.GetClients() {
			client.KeepAlive()
		}
	}
}

// sendMessage Send message to all clients in the pool
func sendMessage(channelID string, message *dto.Message) {
	clientList := clients.GetClientsByChannelID(channelID)
	if len(clientList) == 0 {
		clients.DeleteChannel(channelID)
		return
	}

	for _, client := range clientList {
		client.AddMessage(message)
	}
}
