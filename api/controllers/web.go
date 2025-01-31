package controllers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/ochom/gutils/auth"
	"github.com/ochom/gutils/sqlr"
	"github.com/streamx/core/models"
	"gorm.io/gorm"
)

// WebAuth ...
func WebAuth(c *fiber.Ctx) error {
	token := c.Cookies("streamx-token")
	if token == "" {
		return c.Redirect("/login")
	}

	claims, err := auth.GetAuthClaims(token)
	if err != nil {
		return c.Redirect("/login")
	}

	userID := claims["user_id"]
	if userID == "" {
		return c.Redirect("/login")
	}

	user, err := sqlr.FindOne[models.User](func(db *gorm.DB) *gorm.DB {
		return db.Where("id = ?", userID)
	})

	if err != nil {
		return c.Redirect("/login")
	}

	c.Locals("user", user)
	return c.Next()
}

// Dashboard ...
func Dashboard(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)

	instances := sqlr.Count[models.Instance](func(db *gorm.DB) *gorm.DB {
		return db.Where("user_id = ?", user.ID)
	})

	dashData := []map[string]any{
		{"title": "Total Instances", "value": instances},
		{"title": "Total Messages", "value": 250_000_000},
		{"title": "Active clients", "value": 215},
		{"title": "Unique clients", "value": 250_000},
	}

	return c.Render("dashboard", fiber.Map{
		"Title":    "Home",
		"User":     user,
		"dashData": dashData,
	}, "layouts/main")
}

// Settings ...
func Settings(c *fiber.Ctx) error {
	user := c.Locals("user").(*models.User)
	return c.Render("settings", fiber.Map{
		"data": user,
	}, "layouts/main")
}

// Login ...
func Login(c *fiber.Ctx) error {
	return c.Render("login", fiber.Map{
		"Title": "Login",
	}, "layouts/auth")
}

// DoLogin ...
func DoLogin(c *fiber.Ctx) error {
	var req map[string]string
	if err := c.BodyParser(&req); err != nil {
		return err
	}

	if req["email"] == "" || req["password"] == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Email and password are required",
		})
	}

	user, err := sqlr.FindOne[models.User](func(db *gorm.DB) *gorm.DB {
		return db.Where("email = ?", req["email"])
	})

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid email or password",
		})
	}

	if !user.ComparePassword(req["password"]) {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid email or password",
		})
	}

	tokens, err := auth.GenerateAuthTokens(map[string]string{
		"user_id": user.ID.String(),
		"email":   user.Email,
		"name":    user.Name,
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to generate token",
		})
	}

	c.Cookie(&fiber.Cookie{
		Name:  "streamx-token",
		Value: tokens["token"],
	})

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"user":    user,
	})
}

// Register ...
func Register(c *fiber.Ctx) error {
	return c.Render("home", fiber.Map{
		"Title": "Home",
	})
}

// DoRegister ...
func DoRegister(c *fiber.Ctx) error {
	return c.Render("home", fiber.Map{
		"Title": "Home",
	})
}

// Logout ...
func Logout(c *fiber.Ctx) error {
	return c.Render("home", fiber.Map{
		"Title": "Home",
	})
}
