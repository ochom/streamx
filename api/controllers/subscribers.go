package controllers

import (
	"bufio"

	"github.com/gofiber/fiber/v2"
	"github.com/streamx/core/clients"
	"github.com/streamx/core/constants"
	"github.com/streamx/core/utils"
	"github.com/valyala/fasthttp"
)

// HandleSubscription ...
func HandleSubscription(c *fiber.Ctx) error {
	// validate api key and instance id
	if err := validateClient(c.Params("apiKey")); err != nil {
		return c.Status(401).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	ctx := c.Context()

	ctx.SetContentType("text/event-stream")
	ctx.Response.Header.Set("Cache-Control", "no-cache")
	ctx.Response.Header.Set("Connection", "keep-alive")
	ctx.Response.Header.Set("Transfer-Encoding", "chunked")
	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Cache-Control")
	ctx.Response.Header.Set("Access-Control-Allow-Credentials", "true")

	instanceID := c.Params("instanceID", constants.DefaultInstance)
	channelID := c.Params("channelID", constants.DefaultChannel)

	poolID := utils.GetPoolID(instanceID, channelID)

	channel := clients.GetChannel(poolID)
	client := channel.AddClient(poolID)

	ctx.SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		client.Listen(ctx, channel, w)
	}))

	return nil
}
