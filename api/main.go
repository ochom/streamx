package main

import (
	"os"
	"os/signal"

	"github.com/ochom/gutils/env"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/sqlr"
	"github.com/streamx/core/apps"
	"github.com/streamx/core/models"
	"gorm.io/gorm/logger"
)

func init() {
	err := sqlr.Init(&sqlr.Config{
		LogLevel: logger.Error,
		Url:      env.Get("DATABASE_URL"),
	})

	if err != nil {
		panic(err)
	}

	if err := sqlr.GORM().AutoMigrate(models.GetSchema()...); err != nil {
		panic(err)
	}

	if err := models.CreateFirstInstance(); err != nil {
		panic(err)
	}
}

func main() {
	// Remove all subscriptions
	models.RemoveAllSubscriptions()

	// Run the HTTP server
	go apps.RunHttpServer()

	// Run RabbitMQ consumer
	go apps.RunRabbitMQConsumer()

	// wait for stop signal
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	<-stop

	logs.Info("[X] Shutting down the server")
}
