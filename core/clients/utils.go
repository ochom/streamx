package clients

import "fmt"

func getPoolID(instanceID, channelID string) string {
	return fmt.Sprintf("%s:%s", instanceID, channelID)
}
