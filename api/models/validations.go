package models

import (
	"errors"
	"fmt"
	"time"

	"github.com/ochom/gutils/cache"
	"github.com/ochom/gutils/sqlr"
)

// ValidateSubscriber ...
func ValidateSubscriber(apiKey, instanceID string) error {
	key := fmt.Sprintf("streamx-providers:%s:%s", apiKey, instanceID)
	if cached := cache.Get(key); cached != nil {
		return nil
	}

	query := `
		SELECT 
			i.id, i.name, i.user_id, u.api_key 
		FROM 
			instances i
		LEFT 
			JOIN users u ON i.user_id = u.id
		WHERE 
			i.id = ? AND u.api_key = ?
		LIMIT 1
	`

	var instance *Instance
	if err := sqlr.GORM().Raw(query, instanceID, apiKey).Scan(&instance).Error; err != nil {
		return errors.New("unauthorized, invalid instance")
	}

	if instance == nil {
		return errors.New("unauthorized, instance not found")
	}

	if err := cache.Set(key, []byte("1"), 24*time.Hour); err != nil {
		return err
	}

	return nil
}
