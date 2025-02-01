package models

import (
	"github.com/ochom/gutils/env"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/sqlr"
	"gorm.io/gorm"
)

func GetSchema() []any {
	return []any{
		&User{},
		&Instance{},
		&Subscription{},
		&Event{},
	}
}

// CreateFirstInstance ...
func CreateFirstInstance() error {
	adminName := env.Get("ADMIN_NAME", "admin")
	adminEmail := env.Get("ADMIN_EMAIL", "ochomrichard752@gmail.com")
	adminPassword := env.Get("ADMIN_PASSWORD", "123456")

	// check if a user with this email already exists
	count := sqlr.Count[User](func(db *gorm.DB) *gorm.DB {
		return db.Where("email = ?", adminEmail)
	})

	if count > 0 {
		logs.Info("admin user already exists")
		return nil
	}

	// create user
	user := NewUser(adminName, adminEmail, adminPassword)
	if err := sqlr.GORM().Create(user).Error; err != nil {
		return err
	}

	// create instance
	instance := NewInstance(user.ID, "Default", "Default instance")
	if err := sqlr.GORM().Create(instance).Error; err != nil {
		return err
	}

	return nil
}
