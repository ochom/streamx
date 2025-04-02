package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/pubsub"
	"github.com/ochom/gutils/uuid"
	"github.com/streamx/core/constants"
	"github.com/streamx/core/models"
)

// HandlePublish ...
func HandlePublish(c *fiber.Ctx) error {
	apiKey := c.Get("Authorization")
	if apiKey == "" {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "unauthorized, missing api key"})
	}

	var message models.Message
	if err := c.BodyParser(&message); err != nil {
		return c.JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	if err := models.ValidateSubscriber(apiKey, message.InstanceID); err != nil {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	// TODO check if user limit is not exceeded

	if message.ID == "" {
		message.ID = uuid.New()
	}

	if message.Event == "" {
		message.Event = "message"
	}

	go postMessage(message)
	return c.JSON(fiber.Map{"status": "ok"})
}

// postMessage push message to queue
func postMessage(message models.Message) {
	publisher := pubsub.NewPublisher(constants.RabbitUrl, "STREAMX_EXCHANGE", "")
	publisher.SetExchangeType(pubsub.FanOut)
	publisher.SetConnectionName("streamx-producer")

	if err := publisher.Publish(helpers.ToBytes(message)); err != nil {
		logs.Error("failed to publish message: %s", err.Error())
	}
}
