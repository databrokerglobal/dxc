package database

import (
	"database/sql/driver"
	"time"
)

// Struct that mocks date time objects for testing

// AnyTime struct
type AnyTime struct{}

// Match satisfies sqlmock.Argument interface
func (a AnyTime) Match(v driver.Value) bool {
	_, ok := v.(time.Time)
	return ok
}
