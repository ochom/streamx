package controllers

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/uuid"
	"github.com/streamx/core/apps/dto"
	"github.com/streamx/core/constants"
	"github.com/streamx/core/services"
)

// HandlePublish ...
func HandlePublish(c *fiber.Ctx) error {
	apiKey := c.Get("Authorization")
	if apiKey == "" {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": "unauthorized, missing api key"})
	}

	var message dto.Message
	if err := c.BodyParser(&message); err != nil {
		return c.JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	if err := validateClient(apiKey); err != nil {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	if message.ID == "" {
		message.ID = uuid.New()
	}

	if message.Event == "" {
		message.Event = "message"
	}

	go postMessage(c.Context(), message)
	return c.JSON(fiber.Map{"status": "ok"})
}

// postMessage push message to queue
func postMessage(ctx context.Context, message dto.Message) {
	client := services.GetRedisClient()
	err := client.Publish(ctx, constants.ChannelName, helpers.ToBytes(message)).Err()
	if err != nil {
		logs.Error("failed to publish message to Redis: %s", err.Error())
	}
}
