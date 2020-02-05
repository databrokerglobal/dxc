package database

import (
	"testing"

	"github.com/DATA-DOG/go-sqlmock"

	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
)

func TestManager_CreateProduct(t *testing.T) {
	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		p *Product
	}

	_, mockGorm, _ := provideMockDB()

	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		{"Test case 1", fields{DB: mockGorm}, args{p: &Product{Name: "Test", Type: "API", UUID: uuid.New().String(), Host: "http://localhost:3453"}}, false},
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

	p := &Product{Name: "Test", Type: "API", UUID: "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d", Host: "http://localhost:3453"}

	// New mock db manager instance
	mockSQL, _, mgr := provideMockDB()

	mockSQL.ExpectBegin()
	mockSQL.ExpectExec(`INSERT INTO "products"`).WithArgs(AnyTime{}, AnyTime{}, nil, p.Name, p.Type, p.UUID, p.Host).WillReturnResult(sqlmock.NewResult(1, 7))
	mockSQL.ExpectCommit()
	mockSQL.ExpectationsWereMet()

	mgr.CreateProduct(p)

	tests := []struct {
		name    string
		args    args
		wantP   *Product
		wantErr bool
	}{
		{"Test case 1", args{u: p.UUID}, p, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSQL.ExpectQuery(`SELECT`).WithArgs(p.UUID).WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test"))
			_, err := mgr.GetProduct(tt.args.u)
			if (err != nil) != tt.wantErr {
				t.Errorf("Manager.GetProduct() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}
