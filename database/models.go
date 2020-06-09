package database

import (
	"github.com/jinzhu/gorm"
)

// Datasource struct
type Datasource struct {
	gorm.Model
	Name      string `json:"name"`
	Type      string `json:"type"`
	Did       string `json:"did"`
	Host      string `json:"host"`
	Available bool   `json:"available"`
}

// SyncStatus struct
type SyncStatus struct {
	gorm.Model
	Success    bool   `json:"success"`
	ErrorResp  string `json:"errorResp"`
	StatusCode int    `json:"statusCode"`
	Status     string `json:"status"`
}

// Challenge struct
type Challenge struct {
	gorm.Model
	Challenge string `json:"challenge"`
}

// UserAuth struct to
type UserAuth struct {
	gorm.Model
	Address string `json:"address"`
	APIKey  string `json:"api_key"`
}
