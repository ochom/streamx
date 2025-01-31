package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ochom/gutils/sqlr"
	"github.com/streamx/core/models"
	"gorm.io/gorm"
)

// CreateInstance ...
func CreateInstance(c *fiber.Ctx) error {
	var req map[string]string
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": err.Error()})
	}

	user, err := getToken(c)
	if err != nil {
		return err
	}

	if req["name"] == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "name is required"})
	}

	if req["description"] == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "description is required"})
	}

	instance := models.NewInstance(user.ID, req["name"], req["description"])
	if err := sqlr.Create(&instance); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "failed to create instance"})
	}

	return c.JSON(fiber.Map{"status": "ok"})
}

// GetInstances ...
func GetInstances(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	instances := sqlr.FindAll[models.Instance](func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", user.ID)
	})

	return c.Render("instances", fiber.Map{
		"instances": instances,
	}, "layouts/main")
}

// DeleteInstance ...
func DeleteInstance(c *fiber.Ctx) error {
	user, err := getToken(c)
	if err != nil {
		return err
	}

	instanceID := c.Params("instanceID")
	if instanceID == "" {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "instanceID is required"})
	}

	if err := sqlr.Delete[models.Instance](func(db *gorm.DB) *gorm.DB {
		return db.Where("id = ? AND user_id = ?", instanceID, user.ID)
	}); err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "failed to delete instance"})
	}

	return c.JSON(fiber.Map{"status": "ok"})
}
