package apps

import (
	"bufio"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/clients"
	"github.com/streamx/core/models"
	"github.com/valyala/fasthttp"
)

func RunHttpServer() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowHeaders:     "Cache-Control",
		AllowCredentials: false,
	}))
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Get("/subscribe/:instanceID/:channelID", func(c *fiber.Ctx) error {
		ctx := c.Context()

		ctx.SetContentType("text/event-stream")
		ctx.Response.Header.Set("Cache-Control", "no-cache")
		ctx.Response.Header.Set("Connection", "keep-alive")
		ctx.Response.Header.Set("Transfer-Encoding", "chunked")
		ctx.Response.Header.Set("Access-Control-Allow-Origin", "*")
		ctx.Response.Header.Set("Access-Control-Allow-Headers", "Cache-Control")
		ctx.Response.Header.Set("Access-Control-Allow-Credentials", "true")

		client := clients.NewClient(c.Params("instanceID"), c.Params("channelID"))
		clients.AddClient(client)

		ctx.SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
			client.Listen(w)
		}))
		return nil
	})

	app.Post("/publish/:instanceID/:channelID", func(c *fiber.Ctx) error {
		// TODO check if instanceID and channelID are valid

		// TODO check if user limit is not exceeded

		var message models.Message
		if err := c.BodyParser(&message); err != nil {
			return c.JSON(fiber.Map{"status": "error", "message": err.Error()})
		}

		message.InstanceID = c.Params("instanceID")
		message.ChannelID = c.Params("channelID")
		if message.ID == "" {
			message.ID = uuid.NewString()
		}

		if message.Event == "" {
			message.Event = "message"
		}

		// add message to queue
		broadcastMessage(message)
		return c.JSON(fiber.Map{"status": "ok"})
	})

	logs.Info("Starting the HTTP server")
	if err := app.Listen(":8080"); err != nil {
		panic(err)
	}
}
