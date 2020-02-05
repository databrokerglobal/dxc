package utils

import (
	"github.com/databrokerglobal/dxc/database"
	"github.com/google/uuid"
)

// MakeProduct a product gorm model struct
func MakeProduct(name string, pType string, host string) *database.Product {
	return &database.Product{
		Name: name,
		Type: pType,
		UUID: uuid.New().String(),
		Host: host,
	}
}
