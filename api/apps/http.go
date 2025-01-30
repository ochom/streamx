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
		AllowOrigins:     "*",
		AllowHeaders:     "Cache-Control",
		AllowCredentials: false,
	}))
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok"})
	})

	app.Get("/subscribe/:apiKey/:instanceID/:channelID", controllers.HandleSubscription)
	app.Post("/publish", controllers.HandlePublish)

	app.Route("/profiles", func(r fiber.Router) {
		r.Post("/", controllers.CreateProfile)
		r.Get("/", controllers.GetProfile)
	})

	app.Route("/instances", func(r fiber.Router) {
		r.Post("/", controllers.CreateInstance)
		r.Get("/", controllers.GetInstances)
		r.Delete("/:instanceID", controllers.DeleteInstance)
	})

	logs.Info("[X] Starting the HTTP server")
	if err := app.Listen(":8080"); err != nil {
		panic(err)
	}
}
