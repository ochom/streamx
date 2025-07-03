package main

import (
	"os"
	"os/signal"

	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/apps"
	"github.com/streamx/core/apps/providers"
)

func init() {
	providers.InitializeRedisClient()
}

func main() {

	// Run the HTTP server
	go apps.RunHttpServer()

	// Run consumers
	go apps.RunConsumers()

	// wait for stop signal
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)

	<-stop

	logs.Info("[X] Shutting down the server")
}
