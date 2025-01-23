package clients

import (
	"bufio"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/models"
)

type Client struct {
	id         string
	instanceID string
	channelID  string
	messages   chan *models.Message
}

// NewClient ...
func NewClient(instanceID, channelID string) *Client {
	return &Client{
		id:         uuid.NewString(),
		instanceID: instanceID,
		channelID:  channelID,
		messages:   make(chan *models.Message, 100),
	}
}

func (c *Client) AddMessage(msg *models.Message) {
	c.messages <- msg
}

// welcome send the first message
func (c *Client) welcome() {
	welcomeMessage := &models.Message{
		InstanceID: c.instanceID,
		ChannelID:  c.channelID,
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

func (c *Client) Listen(w *bufio.Writer) {
	go func() {
		for {
			msg := models.NewMessage(c.instanceID, c.channelID, "message", time.Now().String())
			msg.Event = "keep-alive"
			msg.ID = uuid.NewString()

			c.messages <- msg
			<-time.After(15 * time.Second)
		}
	}()

	for msg := range c.messages {
		if err := c.sendMessage(w, msg.Format()); err != nil {
			logs.Error("sending message to client: %s", err)
			break
		}
	}

	// remove client when broken
	removeClient(c)
}
