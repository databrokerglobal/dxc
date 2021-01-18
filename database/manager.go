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
func NewRepository(db *gorm.DB) Repository {
	return &Manager{DB: db}
}

// DBInstance database instance
var DBInstance Manager

// Init Singleton
func init() {
	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		log.Println("Testing: omitting database init")
		return
	}

	dirDB := "./db-data"
	if _, err := os.Stat(dirDB); os.IsNotExist(err) {
		os.Mkdir(dirDB, 0770)
	}
	db, err := gorm.Open("sqlite3", dirDB+"/dxc.db")
	if err != nil {
		log.Fatal("Error connecting to database: ", err)
	}
	DBInstance = Manager{db}
	DBInstance.DB.LogMode(false)
	DBInstance.DB.AutoMigrate(&Datasource{})
	DBInstance.DB.AutoMigrate(&SyncStatus{})
	DBInstance.DB.AutoMigrate(&Challenge{})
	DBInstance.DB.AutoMigrate(&UserAuth{})
	DBInstance.DB.AutoMigrate(&VersionInfo{})
	DBInstance.DB.AutoMigrate(&InfuraID{})
}
