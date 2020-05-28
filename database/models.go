package database

import (
	"github.com/jinzhu/gorm"
)

// File Struct
type File struct {
	gorm.Model
	Name      string `json:"name"`
	ProductID uint
}

// Product struct
type Product struct {
	gorm.Model
	Name   string `json:"name"`
	Type   string `json:"producttype"`
	Did    string `json:"did"`
	Host   string `json:"host"`
	Status string `json:"available"`
	Files  []File
}

// Datasource struct
type Datasource struct {
	gorm.Model
	Name   string `json:"name"`
	Type   string `json:"type"`
	Did    string `json:"did"`
	Host   string `json:"host"`
	Status string `json:"available"`
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
