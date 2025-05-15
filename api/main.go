package main

import (
	"os"
	"os/signal"

	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/apps"
)

func main() {

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
