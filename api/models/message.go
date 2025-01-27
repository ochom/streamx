package models

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/ochom/gutils/helpers"
)

// Message ...
type Message struct {
	InstanceID string `json:"instanceID"`
	Channel    string `json:"channel"`
	ID         string `json:"id"`
	Event      string `json:"event"`
	Data       any    `json:"message"`
}

func NewMessage(instanceID, channel, event, data string) *Message {
	return &Message{
		ID:         uuid.NewString(),
		InstanceID: instanceID,
		Channel:    channel,
		Event:      event,
		Data:       data,
	}
}

func (m Message) Format() string {
	data := getData(m.Data)
	return fmt.Sprintf("id: %s\nevent: %s\ndata: %s\n\n", m.ID, m.Event, data)
}

func getData(data any) string {
	dataString, ok := data.(string)
	if ok {
		return dataString
	}

	dataInt, ok := data.(float64)
	if ok {
		return fmt.Sprintf("%v", dataInt)
	}

	return string(helpers.ToBytes(data))
}
