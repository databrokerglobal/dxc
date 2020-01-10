package database

import (
	"github.com/jinzhu/gorm"
	// loading the sqlite dialect
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"log"
)

// Manager manage db connection
type Manager struct {
	db *gorm.DB
}

// DB database instance
var DB Manager

func init() {
	db, err := gorm.Open("sqlite3", "./database/dxc.db")
	if err != nil {
		log.Fatal("Connection to database failed")
	}
	DB = Manager{db}
	DB.db.LogMode(true)
	DB.db.AutoMigrate(&File{})
}

// CreateFile Query
func (m *Manager) CreateFile(f *File) (err error) {
	m.db.Create(f)
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// GetFile Query
func (m *Manager) GetFile(n string) (f *File, err error) {
	m.db.Where(&File{Name: n}).First(&f)
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// File Struct
type File struct {
	gorm.Model
	Name string `json:"name"`
}
