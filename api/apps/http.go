package apps

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/template/django/v3"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/controllers"
)

func RunHttpServer() {
	webEngine := django.New("./views", ".django")
	app := fiber.New(fiber.Config{
		Views: webEngine,
	})

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
	app.Post("/publish", controllers.HandlePublish)

	app.Route("/", func(r fiber.Router) {
		r.Get("/login", controllers.Login)
		r.Post("/login", controllers.DoLogin)
		r.Get("/register", controllers.Register)
		r.Post("/register", controllers.DoRegister)

		// authenticate every request
		r.Use(controllers.WebAuth)
		r.Get("/", controllers.Dashboard)

		// instances
		r.Get("/instances", controllers.GetInstances)
		r.Get("/instances/create", controllers.CreateInstance)
		r.Post("/instances/create", controllers.DoCreateInstance)
		r.Delete("/instances/:instanceID", controllers.DeleteInstance)

		r.Get("/settings", controllers.Settings)
		r.Get("/logout", controllers.Logout)
	})

	app.Route("/profiles", func(r fiber.Router) {
		r.Post("/", controllers.CreateProfile)
		r.Get("/", controllers.GetProfile)
	})

	logs.Info("[X] Starting the HTTP server")
	if err := app.Listen(":8080"); err != nil {
		panic(err)
	}
}
