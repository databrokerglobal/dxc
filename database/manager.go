package database

import (
	"log"
	"os"

	"github.com/jinzhu/gorm"

	// loading the sqlite dialect
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

// Manager manage db connection
type Manager struct {
	db *gorm.DB
}

// DB database instance
var DB Manager

func init() {
	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		log.Println("Testing: omitting database init")
		return
	}

	db, err := gorm.Open("sqlite3", "./database/dxc.db")
	if err != nil {
		log.Fatal("Error connecting to database")
	}
	DB = Manager{db}
	DB.db.LogMode(true)
	DB.db.AutoMigrate(&File{})
	DB.db.AutoMigrate(&Product{})
}
