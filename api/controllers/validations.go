package controllers

import (
	"errors"

	"github.com/ochom/gutils/env"
)

// validateClient ...
func validateClient(apiKey string) error {
	if key := env.Get("STREAMING_API_KEY"); key != apiKey {
		return errors.New("unauthorized, invalid api key")
	}

	return nil
}
