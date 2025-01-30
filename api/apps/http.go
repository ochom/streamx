package apps

import (
	"bufio"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/uuid"
	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/pubsub"
	"github.com/streamx/core/clients"
	"github.com/streamx/core/models"
	"github.com/streamx/core/utils"
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

	app.Get("/subscribe/:apiKey/:instanceID/:channelID", func(c *fiber.Ctx) error {
		// validate api key and instance id
		if err := models.ValidateSubscriber(c.Params("apiKey"), c.Params("instanceID")); err != nil {
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

		channelID := utils.GetPoolID(c.Params("instanceID"), c.Params("channelID"))
		client := clients.NewClient(channelID)

		channel := clients.GetChannel(channelID)
		channel.AddClient(client)

		ctx.SetBodyStreamWriter(fasthttp.StreamWriter(func(w *bufio.Writer) {
			client.Listen(ctx, channel, w)
		}))
		return nil
	})

	app.Post("/publish", func(c *fiber.Ctx) error {
		token := c.Get("Authorization")
		if token == "" {
			return c.Status(401).JSON(fiber.Map{"status": "error", "message": "unauthorized, missing api key"})
		}

		var message models.Message
		if err := c.BodyParser(&message); err != nil {
			return c.JSON(fiber.Map{"status": "error", "message": err.Error()})
		}

		if err := models.ValidateSubscriber(token, message.InstanceID); err != nil {
			return c.Status(401).JSON(fiber.Map{"status": "error", "message": err.Error()})
		}

		// TODO check if user limit is not exceeded

		if message.ID == "" {
			message.ID = uuid.NewString()
		}

		if message.Event == "" {
			message.Event = "message"
		}

		go postMessage(message)
		return c.JSON(fiber.Map{"status": "ok"})
	})

	logs.Info("[X] Starting the HTTP server")
	if err := app.Listen(":8080"); err != nil {
		panic(err)
	}
}

// postMessage push message to queue
func postMessage(message models.Message) {
	publisher := pubsub.NewPublisher(rabbitUrl, "STREAMX_EXCHANGE")
	publisher.SetExchangeType(pubsub.FanOut)
	publisher.SetConnectionName("streamx-producer")

	if err := publisher.Publish(helpers.ToBytes(message)); err != nil {
		logs.Error("failed to publish message: %s", err.Error())
	}
}
