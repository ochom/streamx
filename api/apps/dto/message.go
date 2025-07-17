package dto

import (
	"fmt"

	"github.com/google/uuid"
	"github.com/ochom/gutils/helpers"
)

// Message ...
type Message struct {
	ID       string `json:"id"`
	Instance string `json:"instance"`
	Channel  string `json:"channel"`
	Event    string `json:"event"`
	Data     any    `json:"data"`
	Message  any    `json:"message,omitempty"` // Deprecated, use Data instead
}

// NewMessage ...
func NewMessage(instance, channel, event string, data any) *Message {
	return &Message{
		ID:       uuid.NewString(),
		Instance: instance,
		Channel:  channel,
		Event:    event,
		Data:     data,
	}
}

func (m *Message) loadData() {
	if m.Data == nil {
		m.Data = m.Message // Fallback to Message if Data is nil
		m.Message = nil    // Clear Message to avoid duplication
	}
}

// Format ...
func (m Message) Format() string {
	m.loadData()
	data := getData(m.Data)
	return fmt.Sprintf("id: %s\nevent: %s\ndata: %s\n\n", m.ID, m.Event, data)
}

// JSON ...
func (m Message) JSON() string {
	m.loadData()
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

	dataBool, ok := data.(bool)
	if ok {
		return fmt.Sprintf("%v", dataBool)
	}

	dataBytes, ok := data.([]byte)
	if ok {
		return string(dataBytes)
	}

	return string(helpers.ToBytes(data))
}
