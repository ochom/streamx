package dto

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/ochom/gutils/helpers"
)

// Message ...
type Message struct {
	ID         string `json:"id"`
	InstanceID string `json:"instanceID"`
	Channel    string `json:"channel"`
	Event      string `json:"event"`
	Data       any    `json:"data"`
	Message    any    `json:"message,omitempty"` // Deprecated, use Data instead
}

func NewMessage(instanceID, channel, event string, data any) *Message {
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

func (m Message) JSON() string {
	if m.Data == nil {
		m.Data = m.Message // Fallback to Message if Data is nil
	}

	return string(helpers.ToBytes(m))
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
