package utils

import (
	"github.com/databrokerglobal/dxc/database"
)

// MakeProduct a product gorm model struct
func MakeProduct(name string, pType string, did string, host string) *database.Product {
	return &database.Product{
		Name: name,
		Type: pType,
		Did:  did,
		Host: host,
	}
}
