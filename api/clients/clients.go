package clients

import (
	"bufio"
	"fmt"

	"github.com/google/uuid"
	"github.com/ochom/gutils/helpers"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/models"
	"github.com/valyala/fasthttp"
)

type Client struct {
	id       string
	poolID   string
	messages chan *models.Message
}

// NewClient ...
func NewClient(poolID string) *Client {
	return &Client{
		id:       uuid.NewString(),
		poolID:   poolID,
		messages: make(chan *models.Message, 100),
	}
}

// GetPoolID ...
func (c *Client) GetPoolID() string {
	return c.poolID
}

// AddMessage ...
func (c *Client) AddMessage(msg *models.Message) {
	if c == nil {
		logs.Error("client is nil")
		return
	}

	c.messages <- msg
}

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

		logs.Info("message sent==> client: %s, message: %s", c.id, string(helpers.ToBytes(msg)))
	}

	channel.RemoveClient(c)
}
