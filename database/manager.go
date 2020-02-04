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
	DB *gorm.DB
}

// NewRepository func
// We can return a Manager struct because all it's methods
// satisfy the Repository interface type
// This allows us to create new Managers using any driver
// TIP: DB() method on a gorm db return a db of type *sql.DB should you need it
func NewRepository(db *sql.DB) Repository {
	return &Manager{DB: db}
}

// DBInstance database instance
var DBInstance Manager

func init() {
	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		log.Println("Testing: omitting database init")
		return
	}

	db, err := gorm.Open("sqlite3", "./database/dxc.db")
	if err != nil {
		log.Fatal("Error connecting to database")
	}
	DBInstance = Manager{db}
	DBInstance.DB.LogMode(true)
	DBInstance.DB.AutoMigrate(&File{})
	DBInstance.DB.AutoMigrate(&Product{})
}
