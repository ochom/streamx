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

	poolID := utils.GetPoolID(client.instanceID, client.channel)
	logs.Info("adding new client: %s to pool: %s", client.id, poolID)
	if _, ok := clientPool[poolID]; !ok {
		clientPool[poolID] = []*Client{}
	}

	clientPool[poolID] = append(clientPool[poolID], client)
}

// RemoveClient ...
func RemoveClient(client *Client) {
	mux.Lock()
	defer mux.Unlock()

	poolID := utils.GetPoolID(client.instanceID, client.channel)
	logs.Info("removing client: %s from pool: %s", client.id, poolID)
	if _, ok := clientPool[poolID]; !ok {
		return
	}

	clients := slices.DeleteFunc(clientPool[poolID], func(c *Client) bool {
		return c.id == client.id
	})

	if len(clients) == 0 {
		delete(clientPool, poolID)
	} else {
		clientPool[poolID] = clients
	}
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

// GetPools ...
func GetPools() []string {
	mux.Lock()
	defer mux.Unlock()

	pools := []string{}
	for poolID := range clientPool {
		pools = append(pools, poolID)
	}

	return pools
}
