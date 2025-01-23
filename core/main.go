package main

import (
	"os"
	"os/signal"

	"github.com/ochom/gutils/env"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/sqlr"
	"github.com/streamx/core/apps"
	"github.com/streamx/core/models"
)

func init() {
	err := sqlr.Init(&sqlr.Config{
		Url: env.Get("DB_URL"),
	})

	if err != nil {
		panic(err)
	}

	if err := sqlr.GORM().AutoMigrate(models.GetSchema()...); err != nil {
		panic(err)
	}

}

func main() {
	// Run the consumer
	go apps.RunConsumer()

	// Run the HTTP server
	go apps.RunHttpServer()

	// wait for stop signal
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	<-stop

	logs.Info("Shutting down the server")
}
