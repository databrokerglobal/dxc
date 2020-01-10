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

// GetFiles Get all files query
func (m *Manager) GetFiles() (fs *[]File, err error) {
	files := []File{}
	m.db.Table("files").Find(&files)
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &files, nil
}

// File Struct
type File struct {
	gorm.Model
	Name string `json:"name"`
}
