package database

import (
	"fmt"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jinzhu/gorm"
)

var (
	dsnCount int64
)

func provideMockDB() (sqlmock.Sqlmock, *gorm.DB, Repository) {
	dsn := fmt.Sprintf("sqlmock_db_%d", dsnCount)
	_, mock, err := sqlmock.NewWithDSN(dsn)
	if err != nil {
		panic(err)
	}
	mockGorm, err := gorm.Open("sqlmock", dsn)
	if err != nil {
		panic(err)
	}
	mgr := NewRepository(mockGorm)
	dsnCount++

	return mock, mockGorm, mgr
}
