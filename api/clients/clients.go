package clients

import (
	"bufio"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/apps/dto"
	"github.com/streamx/core/utils"
	"github.com/valyala/fasthttp"
)

type Client struct {
	id       string
	poolID   string
	messages chan *dto.Message
}

// NewClient ...
func NewClient(poolID string) *Client {
	client := &Client{
		id:       uuid.NewString(),
		poolID:   poolID,
		messages: make(chan *dto.Message, 100),
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
	msg := dto.NewMessage(instance, channel, "welcome", data)
	c.AddMessage(msg)
}

// KeepAlive ...
func (c *Client) KeepAlive() {
	data := map[string]string{
		"message": "Keep Alive",
		"time":    time.Now().Format(time.RFC3339),
	}

	instance, channel := utils.GetPoolDetails(c.poolID)
	msg := dto.NewMessage(instance, channel, "keep-alive", data)
	c.AddMessage(msg)
}

// AddMessage ...
func (c *Client) AddMessage(msg *dto.Message) {
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
			logs.Error("client left: %s", c.id)
			break
		}

		switch msg.Event {
		case "keep-alive":
			logs.Debug("client kept alive: %s", c.id)
		case "welcome":
			logs.Warn("new client joined: %s ", c.id)
		default:
			logs.Info("message sent: %s", msg.JSON())
		}
	}

	channel.RemoveClient(c)
}
