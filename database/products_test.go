package database

import (
	"reflect"
	"testing"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
	mocket "github.com/selvatico/go-mocket"
)

func TestManager_CreateProduct(t *testing.T) {
	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		p *Product
	}

	// Set up mock db options
	mocket.Catcher.Register() // Safe register. Allowed multiple calls to save
	mocket.Catcher.Logging = true

	// Get mock Gorm instance
	db, _ := gorm.Open(mocket.DriverName, "connection_string") // Can be any connection string

	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		{"Test case 1", fields{DB: db}, args{p: &Product{Name: "Test", Type: "API", UUID: uuid.New().String(), Host: "http://localhost:3453"}}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			if err := m.CreateProduct(tt.args.p); (err != nil) != tt.wantErr {
				t.Errorf("Manager.CreateProduct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestManager_GetProduct(t *testing.T) {
	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		u string
	}

	// Set up mock db options
	mocket.Catcher.Register() // Safe register. Allowed multiple calls to save
	mocket.Catcher.Logging = true

	// Get mock Gorm instance
	db, _ := gorm.Open(mocket.DriverName, "connection_string") // Can be any connection string

	// New mock db manager instance
	mgr := NewRepository(db)
	p := &Product{Name: "Test", Type: "API", UUID: "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d", Host: "http://localhost:3453"}
	mgr.CreateProduct(p)

	tests := []struct {
		name    string
		fields  fields
		args    args
		wantP   *Product
		wantErr bool
	}{
		{"Test case 1", fields{DB: db}, args{u: p.UUID}, p, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			gotP, err := m.GetProduct(tt.args.u)
			if (err != nil) != tt.wantErr {
				t.Errorf("Manager.GetProduct() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(gotP, tt.wantP) {
				t.Errorf("Manager.GetProduct() = %v, want %v", gotP, tt.wantP)
			}
		})
	}
}
