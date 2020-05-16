package database

import (
	"reflect"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
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
		{"Test case 1", fields{DB: mockGorm}, args{p: &Product{Name: "Test", Type: "API", Did: "did", Host: "http://localhost:3453"}}, false},
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

	p := &Product{Name: "Test", Type: "API", Did: "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d", Host: "http://localhost:3453"}

	// New mock db manager instance
	mockSQL, _, mgr := provideMockDB()

	mockSQL.ExpectBegin()
	mockSQL.ExpectExec(`INSERT INTO "products"`).WithArgs(AnyTime{}, AnyTime{}, nil, p.Name, p.Type, p.Did, p.Host).WillReturnResult(sqlmock.NewResult(1, 7))
	mockSQL.ExpectCommit()
	mockSQL.ExpectationsWereMet()

	mgr.CreateProduct(p)

	tests := []struct {
		name    string
		args    args
		wantP   *Product
		wantErr bool
	}{
		{"Test case 1", args{u: p.Did}, p, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSQL.ExpectQuery(`SELECT`).WithArgs(p.Did).WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test"))
			_, err := mgr.GetProductByDID(tt.args.u)
			if (err != nil) != tt.wantErr {
				t.Errorf("Manager.GetProduct() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}

func TestManager_GetProducts(t *testing.T) {
	type fields struct {
		DB *gorm.DB
	}

	_, gorm, _ := provideMockDB()

	tests := []struct {
		name    string
		fields  fields
		wantPs  *[]Product
		wantErr bool
	}{
		{"First pass", fields{DB: gorm}, &[]Product{}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			gotPs, err := m.GetProducts()
			if (err != nil) != tt.wantErr {
				t.Errorf("Manager.GetProducts() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(gotPs, tt.wantPs) {
				t.Errorf("Manager.GetProducts() = %v, want %v", gotPs, tt.wantPs)
			}
		})
	}
}

func TestManager_DeleteProduct(t *testing.T) {
	_, gormMock, _ := provideMockDB()

	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		ProductName string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		{"First pass", fields{DB: gormMock}, args{ProductName: "Test"}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			if err := m.DeleteProduct(tt.args.ProductName); (err != nil) != tt.wantErr {
				t.Errorf("Manager.DeleteProduct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
