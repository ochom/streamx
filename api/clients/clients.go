package clients

import (
	"bufio"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/models"
	"github.com/streamx/core/utils"
	"github.com/valyala/fasthttp"
)

type Client struct {
	id       string
	poolID   string
	messages chan *models.Message
}

// NewClient ...
func NewClient(poolID string) *Client {
	client := &Client{
		id:       uuid.NewString(),
		poolID:   poolID,
		messages: make(chan *models.Message, 100),
	}

	client.welcome()
	return client
}

// welcome ...
func (c *Client) welcome() {
	// send first message to this client
	data := map[string]any{
		"message": "Welcome to StreamX",
		"time":    time.Now().Format(time.RFC3339),
	}

	instance, channel := utils.GetPoolDetails(c.poolID)
	msg := models.NewMessage(instance, channel, "welcome", data)
	c.AddMessage(msg)
}

// KeepAlive ...
func (c *Client) KeepAlive() {
	data := map[string]string{
		"message": "Keep Alive",
		"time":    time.Now().Format(time.RFC3339),
	}

	instance, channel := utils.GetPoolDetails(c.poolID)
	msg := models.NewMessage(instance, channel, "keep-alive", data)
	c.AddMessage(msg)
}

// AddMessage ...
func (c *Client) AddMessage(msg *models.Message) {
	if c == nil {
		logs.Error("client is nil")
		return
	}

	c.messages <- msg
}

// Listen listen to all messages sent to this client
func (c *Client) Listen(ctx *fasthttp.RequestCtx, channel *Channel, w *bufio.Writer) {
	for msg := range c.messages {
		_, err := fmt.Fprint(w, msg.Format())
		if err != nil {
			logs.Error("sending message to client: %s, err: %s", c.id, err.Error())
			break
		}

		if err := w.Flush(); err != nil {
			logs.Error("flushing message to client: %s, err: %s", c.id, err.Error())
			break
		}

		switch msg.Event {
		case "keep-alive":
			logs.Debug("message sent==> client: %s, message: %s", c.id, msg.JSON())
		case "welcome":
			logs.Warn("message sent==> client: %s, message: %s", c.id, msg.JSON())
		default:
			logs.Info("message sent==> client: %s, message: %s", c.id, msg.JSON())
		}
	}

	channel.RemoveClient(c)
	instanceID, _ := utils.GetPoolDetails(c.poolID)
	models.RemoveSubscriber(instanceID)
}
