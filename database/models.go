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
	Name  string `json:"name"`
	Type  string `json:"producttype"`
	UUID  string `json:"uuid"`
	Host  string `json:"host"`
	Files []File
}
