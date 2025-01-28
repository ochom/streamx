package clients

import (
	"bufio"
	"fmt"

	"github.com/google/uuid"
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

// sendMessage ...
func (c *Client) sendMessage(writer *bufio.Writer, message string) error {
	_, err := fmt.Fprint(writer, message)
	if err != nil {
		return err
	}

	if err := writer.Flush(); err != nil {
		return err
	}

	logs.Info("message sent to clientID: %s", c.id)
	return nil
}

func (c *Client) Listen(ctx *fasthttp.RequestCtx, channel *Channel, w *bufio.Writer) {
	for msg := range c.messages {
		if err := c.sendMessage(w, msg.Format()); err != nil {
			logs.Error("sending message to client: %s, err: %s", c.id, err.Error())
			break
		}
	}

	channel.RemoveClient(c)
}
