package utils

import (
	"fmt"
	"strings"
)

// GetPoolID ...
func GetPoolID(instanceID, channelID string) string {
	return fmt.Sprintf("%s:%s", instanceID, channelID)
}

// GetPoolDetails ...
func GetPoolDetails(poolID string) (string, string) {
	p := strings.Split(poolID, ":")
	return p[0], p[1]
}
