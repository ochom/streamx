package controllers

import (
	"bufio"

	"github.com/gofiber/fiber/v2"
	"github.com/streamx/core/clients"
	"github.com/valyala/fasthttp"
)

// HandleSubscription ...
func HandleSubscription(c *fiber.Ctx) error {
	ctx := c.Context()
	ctx.SetContentType("text/event-stream")
	ctx.Response.Header.Set("Cache-Control", "no-cache")
	ctx.Response.Header.Set("Connection", "keep-alive")
	ctx.Response.Header.Set("Transfer-Encoding", "chunked")
	ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
	ctx.Response.Header.Set("Access-Control-Allow-Headers", "Cache-Control")
	ctx.Response.Header.Set("Access-Control-Allow-Credentials", "true")

	channel := clients.GetChannel(c.Params("channelID"))
	client := channel.AddClient()

	ctx.SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
		client.Listen(ctx, channel, w)
	}))

	return nil
}
