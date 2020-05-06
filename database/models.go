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
	DID    string `json:"did"`
	Host   string `json:"host"`
	Status string `json:"available"`
	Files  []File
}
