package apps

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/controllers"
)

func RunHttpServer() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowHeaders:     "Cache-Control",
		AllowCredentials: true,
		AllowOriginsFunc: func(origin string) bool {
			return true
		},
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Get("/subscribe/:apiKey/:instanceID/:channelID", controllers.HandleSubscription)
	app.Get("/subscribe/:channelID", controllers.HandleSubscription)
	app.Post("/publish", controllers.HandlePublish)

	logs.Info("[X] Starting the HTTP server")
	if err := app.Listen(":8080"); err != nil {
		panic(err)
	}
}
