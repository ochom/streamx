package models

import (
	"time"

	"github.com/ochom/gutils/logs"
	"github.com/ochom/gutils/sqlr"
)

// Subscription ...
type Subscription struct {
	ID         uint64 `json:"id"`
	InstanceID string `json:"instance_id" gorm:"uniqueIndex:idx_instance_id_event_date_hour"`
	EventDate  string `json:"event_date" gorm:"uniqueIndex:idx_instance_id_event_date_hour"`
	Hour       int    `json:"hour" gorm:"uniqueIndex:idx_instance_id_event_date_hour"`
	Joined     int    `json:"joined" gorm:"default:0"`
	Left       int    `json:"left" gorm:"default:0"`
}

// AddSubscriber ...
func AddSubscriber(instanceID string) {
	hour := time.Now().Hour()
	eventDate := time.Now().Format("2006-01-02")

	query := `
		INSERT INTO subscriptions 
			(instance_id, event_date, hour, joined)
		VALUES 
			(?, ?, ?, 1)
		ON CONFLICT (instance_id, event_date, hour) DO 
		UPDATE SET
				joined = EXCLUDED.joined + 1;
	`
	res := sqlr.GORM().Exec(query, instanceID, eventDate, hour)
	if res.Error != nil {
		logs.Error("Add subscriber==> error: %v", res.Error)
		return
	}

	logs.Info("Add subscriber==> affected: %d", res.RowsAffected)
}

// RemoveSubscriber ...
func RemoveSubscriber(instanceID string) {
	hour := time.Now().Hour()
	eventDate := time.Now().Format("2006-01-02")

	query := `
		INSERT INTO subscriptions 
			(instance_id, event_date, hour, "left")
		VALUES 
			(?, ?, ?, 1)
		ON CONFLICT (instance_id, event_date, hour) DO 
		UPDATE SET
				"left" = EXCLUDED."left" + 1;
	`
	res := sqlr.GORM().Exec(query, instanceID, eventDate, hour)
	if res.Error != nil {
		logs.Error("Remove subscriber==> error: %v", res.Error)
		return
	}

	logs.Info("Remove subscriber==> affected: %d", res.RowsAffected)
}

// RemoveAllSubscriptions ...
func RemoveAllSubscriptions() {
	hour := time.Now().Hour()
	eventDate := time.Now().Format("2006-01-02")

	query := `
		UPDATE subscriptions
		SET "left" = joined
		WHERE
			DATE(event_date) = DATE(?)
			AND hour = ?;
	`

	res := sqlr.GORM().Exec(query, eventDate, hour)
	if res.Error != nil {
		logs.Error("Remove all subscriptions==> error: %v", res.Error)
		return
	}

	logs.Info("Remove all subscriptions==> affected: %d", res.RowsAffected)
}
