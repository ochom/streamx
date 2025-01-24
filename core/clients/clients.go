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
	id         string
	instanceID string
	channel    string
	messages   chan *models.Message
}

// NewClient ...
func NewClient(instanceID, channel string) *Client {
	return &Client{
		id:         uuid.NewString(),
		instanceID: instanceID,
		channel:    channel,
		messages:   make(chan *models.Message, 100),
	}
}

func (c *Client) AddMessage(msg *models.Message) {
	if c == nil {
		logs.Error("client is nil")
		return
	}

	c.messages <- msg
}

// welcome send the first message
func (c *Client) welcome() {
	welcomeMessage := &models.Message{
		InstanceID: c.instanceID,
		Channel:    c.channel,
		ID:         uuid.NewString(),
		Event:      "connected",
		Data:       "Connected to the server",
	}

	c.AddMessage(welcomeMessage)
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

	logs.Info("message sent to client: %s", message)
	return nil
}

func (c *Client) Listen(ctx *fasthttp.RequestCtx, w *bufio.Writer) {
	stop := make(chan int, 1)

	go func() {
		for {
			select {
			case msg := <-c.messages:
				if err := c.sendMessage(w, msg.Format()); err != nil {
					logs.Error("sending message to client: %s", err)
					stop <- 1
					return
				}
			case <-ctx.Done():
				logs.Info("client disconnected: %s", c.id)
				stop <- 1
				return
			}
		}
	}()

	<-stop
	RemoveClient(c)
}
