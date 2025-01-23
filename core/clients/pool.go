package clients

import (
	"slices"
	"sync"

	"github.com/ochom/gutils/logs"
	"github.com/streamx/core/utils"
)

var clientPool = make(map[string][]*Client)
var mux sync.Mutex

// AddClient ...
func AddClient(client *Client) {
	mux.Lock()
	defer mux.Unlock()

	poolID := utils.GetPoolID(client.instanceID, client.channelID)
	logs.Info("adding new client: %s to pool: %s", client.id, poolID)
	if _, ok := clientPool[poolID]; !ok {
		clientPool[poolID] = []*Client{}
	}

	clientPool[poolID] = append(clientPool[poolID], client)
}

// removeClient ...
func removeClient(client *Client) {
	mux.Lock()
	defer mux.Unlock()

	poolID := utils.GetPoolID(client.instanceID, client.channelID)
	logs.Info("removing client: %s from pool: %s", client.id, poolID)
	if _, ok := clientPool[poolID]; !ok {
		return
	}

	clientPool[poolID] = slices.DeleteFunc(clientPool[poolID], func(c *Client) bool {
		return c.id == client.id
	})
}

// GetClients ...
func GetClients(poolID string) []*Client {
	mux.Lock()
	defer mux.Unlock()
	if _, ok := clientPool[poolID]; !ok {
		return []*Client{}
	}

	return clientPool[poolID]
}
