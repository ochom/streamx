package controllers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/ochom/gutils/sqlr"
	"github.com/streamx/core/models"
	"gorm.io/gorm"
)

// getToken ...
func getToken(c *fiber.Ctx) (*models.User, error) {
	token := c.Get("Authorization")
	if token == "" {
		return nil, fmt.Errorf("unauthorized, missing api key")
	}

	user, err := sqlr.FindOne[models.User](func(db *gorm.DB) *gorm.DB {
		return db.Where("api_key = ?", token)
	})

	if err != nil {
		return nil, fmt.Errorf("unauthorized, invalid api key")
	}

	return user, nil
}
