package models

import "fmt"

// Message ...
type Message struct {
	InstanceID string `json:"instanceID"`
	ChannelID  string `json:"channelID"`
	ID         string `json:"id"`
	Event      string `json:"event"`
	Data       string `json:"message"`
}

func NewMessage(instanceID, channelID, event, data string) *Message {
	return &Message{
		InstanceID: instanceID,
		ChannelID:  channelID,
		ID:         "",
		Event:      event,
		Data:       data,
	}
}

func (m Message) Format() string {
	return fmt.Sprintf("id: %s\nevent: %s\ndata: %s\n\n", m.ID, m.Event, m.Data)
}
