package models

import (
	"errors"

	"github.com/ochom/gutils/sqlr"
)

// ValidateSubscriber ...
func ValidateSubscriber(apiKey, instanceID string) error {
	query := `
		SELECT 
			i.id, i.name, i.user_id, u.api_key 
		FROM 
			instances i
		LEFT 
			JOIN users u ON i.user_id = u.id
		WHERE 
			i.instance_id = ? AND u.api_key = ?
		LIMIT 1
	`

	var instance *Instance
	if err := sqlr.GORM().Raw(query, instanceID, apiKey).Scan(&instance).Error; err != nil {
		return errors.New("unauthorized, invalid instance")
	}

	if instance == nil {
		return errors.New("unauthorized, instance not found")
	}

	return nil
}
