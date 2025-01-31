package controllers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/sqlr"
	"github.com/streamx/core/models"
	"gorm.io/gorm"
)

// CreateProfile ...
func CreateProfile(c *fiber.Ctx) error {
	var req map[string]string
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	if req["email"] == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "email is required"})
	}

	if req["password"] == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "password is required"})
	}

	if !strings.Contains(req["email"], "@") {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "invalid email address"})
	}

	splits := strings.Split(req["email"], "@")
	if len(splits) != 2 {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "invalid email address"})
	}

	userName := splits[0]
	user := models.NewUser(userName, req["email"], req["password"])
	if err := sqlr.Create(user); err != nil {
		logs.Error("failed to create user: %s", err.Error())
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "failed to create account, email already exists"})
	}

	return c.JSON(user)
}

// GetProfile ...
func GetProfile(c *fiber.Ctx) error {
	email := c.Query("email")
	if email == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "email is required"})
	}

	user, err := sqlr.FindOne[models.User](func(db *gorm.DB) *gorm.DB {
		return db.Where("email = ?", email)
	})

	if err != nil {
		logs.Error("failed to get user profile: %s", err.Error())
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "failed to get user profile"})
	}

	return c.JSON(user)
}
