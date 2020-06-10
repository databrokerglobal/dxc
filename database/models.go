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

// InfuraID struct to
type InfuraID struct {
	gorm.Model
	InfuraID string `json:"infuraID"`
}
