package clients

import (
	"sync"
)

type ConnectionPool struct {
	clients map[string]*Channel
	mux     sync.Mutex
}

var pool *ConnectionPool

func init() {
	pool = &ConnectionPool{
		clients: make(map[string]*Channel),
	}
}

// GetChannel ...
func GetChannel(poolID string) *Channel {
	pool.mux.Lock()
	defer pool.mux.Unlock()

	if _, ok := pool.clients[poolID]; !ok {
		channel := NewChannel(poolID)
		pool.clients[poolID] = channel
		return channel
	}

	return pool.clients[poolID]
}

// DeleteChannel ...
func DeleteChannel(poolID string) {
	pool.mux.Lock()
	defer pool.mux.Unlock()

	clients := pool.clients
	delete(clients, poolID)

	pool.clients = clients
}

// GetClients return all clients in every channel
func GetClients() []*Client {
	pool.mux.Lock()
	defer pool.mux.Unlock()

	var clients []*Client
	for _, channel := range pool.clients {
		for _, client := range channel.clients {
			clients = append(clients, client)
		}
	}

	return clients
}

// GetClientsByPoolID ...
func GetClientsByPoolID(poolID string) []*Client {
	pool.mux.Lock()
	defer pool.mux.Unlock()

	channel, ok := pool.clients[poolID]
	if !ok {
		return []*Client{}
	}

	clients := []*Client{}
	for _, client := range channel.clients {
		clients = append(clients, client)
	}

	return clients
}
