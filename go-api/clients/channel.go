package clients

import (
	"sync"
)

// Channel ...
type Channel struct {
	id      string
	clients map[string]*Client
	mux     sync.Mutex
}

// newChannel ...
func newChannel(id string) *Channel {
	return &Channel{
		id:      id,
		clients: make(map[string]*Client),
	}
}

// AddClient ...
func (c *Channel) AddClient() *Client {
	c.mux.Lock()
	defer c.mux.Unlock()

	client := newClient(c.id)
	c.clients[client.id] = client
	return client
}

// RemoveClient ...
func (c *Channel) RemoveClient(client *Client) {
	c.mux.Lock()
	defer c.mux.Unlock()

	delete(c.clients, client.id)
}

// GetClients ...
func (c *Channel) GetClients() []*Client {
	c.mux.Lock()
	defer c.mux.Unlock()

	var clients []*Client
	for _, client := range c.clients {
		clients = append(clients, client)
	}

	return clients
}
