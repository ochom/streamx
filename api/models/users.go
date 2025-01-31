package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/ochom/gutils/helpers"
	uuidx "github.com/ochom/gutils/uuid"
	"gorm.io/gorm"
)

// User  ...
type User struct {
	ID        uuid.UUID `json:"id" gorm:"primaryKey;default:uuid_generate_v4()"`
	ApiKey    string    `json:"api_key" gorm:"uniqueIndex"`
	PublicKey string    `json:"public_key" gorm:"uniqueIndex"`
	Name      string    `json:"name"`
	Email     string    `json:"email" gorm:"unique"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

// AfterFind ...
func (u *User) AfterFind(tx *gorm.DB) (err error) {
	if u.Password == "" {
		u.Password = helpers.HashPassword("123456")
		tx.Save(u)
	}

	if u.PublicKey == "" {
		u.PublicKey = u.ApiKey
		tx.Save(u)
	}

	return
}

// NewUser ...
func NewUser(name, email, password string) *User {
	return &User{
		Name:      name,
		Email:     email,
		Password:  helpers.HashPassword(password),
		ApiKey:    uuidx.New(),
		PublicKey: uuid.NewString(),
	}
}

// BeforeCreate ...
func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ApiKey == "" {
		u.ApiKey = uuidx.New()
	}
	return
}

// ComparePassword ...
func (u *User) ComparePassword(password string) bool {
	return helpers.ComparePassword(u.Password, password)
}

// Instance ...
type Instance struct {
	ID          uuid.UUID `json:"id" gorm:"primaryKey;default:uuid_generate_v4()"`
	UserID      uuid.UUID `json:"user_id" gorm:"index"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at" gorm:"default:now()"`

	User *User `json:"user" gorm:"foreignKey:UserID"`
}

// NewInstance ...
func NewInstance(userID uuid.UUID, name, description string) *Instance {
	return &Instance{
		ID:          uuid.New(),
		UserID:      userID,
		Name:        name,
		Description: description,
	}
}
