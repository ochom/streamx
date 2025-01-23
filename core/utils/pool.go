package utils

import "fmt"

func GetPoolID(instanceID, channelID string) string {
	return fmt.Sprintf("%s:%s", instanceID, channelID)
}
