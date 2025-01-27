package models

import (
	"errors"

	"github.com/ochom/gutils/sqlr"
	"gorm.io/gorm"
)

// ValidateSubscriber ...
func ValidateSubscriber(apiKey, instanceID string) error {
	// validate api key
	user, err := sqlr.FindOne[User](func(db *gorm.DB) *gorm.DB {
		return db.Where("api_key = ?", apiKey)
	})

	if err != nil {
		return errors.New("unauthorized, invalid api key")
	}

	// check if this user owns the instance
	query := "SELECT * FROM instances WHERE id = ? AND user_id = ? LIMIT 1"
	var instance *Instance
	if err := sqlr.GORM().Raw(query, instanceID, user.ID).Scan(&instance).Error; err != nil {
		return errors.New("unauthorized, invalid instance")
	}

	if instance == nil {
		return errors.New("unauthorized, instance not found")
	}

	return nil
}
