package controllers

import (
	"errors"

	"github.com/ochom/gutils/env"
)

// validateClient ...
func validateClient(apiKey string) error {
	if key := env.Get("API_KEY"); key != apiKey {
		return errors.New("unauthorized, invalid api key")
	}

	return nil
}
