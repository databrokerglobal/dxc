package database

import (
	"reflect"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/jinzhu/gorm"
)

func TestManager_CreateFile(t *testing.T) {

	_, gormMock, _ := provideMockDB()

	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		f *File
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		{"First pass", fields{DB: gormMock}, args{f: &File{Name: "hello.txt"}}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			if err := m.CreateFile(tt.args.f); (err != nil) != tt.wantErr {
				t.Errorf("Manager.CreateFile() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestManager_GetFile(t *testing.T) {

	mockSQL, gormMock, m := provideMockDB()

	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		n string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantF   *File
		wantErr bool
	}{
		{"First pass", fields{DB: gormMock}, args{n: "Test"}, &File{Name: "Test"}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockSQL.ExpectBegin()
			mockSQL.ExpectExec(`INSERT INTO "files"`).WithArgs(AnyTime{}, AnyTime{}, nil, "Test").WillReturnResult(sqlmock.NewResult(1, 4))
			mockSQL.ExpectCommit()
			mockSQL.ExpectationsWereMet()

			mockSQL.ExpectQuery(`SELECT`).WithArgs("Test").WillReturnRows(sqlmock.NewRows([]string{"name"}).AddRow("Test"))
			m.CreateFile(&File{Name: "Test"})

			_, err := m.GetFile(tt.args.n)
			if (err != nil) != tt.wantErr {
				t.Errorf("Manager.GetFile() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
		})
	}
}

func TestManager_GetFiles(t *testing.T) {
	_, gormMock, _ := provideMockDB()

	type fields struct {
		DB *gorm.DB
	}
	tests := []struct {
		name    string
		fields  fields
		wantFs  *[]File
		wantErr bool
	}{
		{"First pass", fields{DB: gormMock}, &[]File{}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			gotFs, err := m.GetFiles()
			if (err != nil) != tt.wantErr {
				t.Errorf("Manager.GetFiles() error = %v, wantErr %v", err, tt.wantErr)
				return
			}
			if !reflect.DeepEqual(gotFs, tt.wantFs) {
				t.Errorf("Manager.GetFiles() = %v, want %v", gotFs, tt.wantFs)
			}
		})
	}
}

func TestManager_DeleteFile(t *testing.T) {
	_, gormMock, _ := provideMockDB()

	type fields struct {
		DB *gorm.DB
	}
	type args struct {
		fileName string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		wantErr bool
	}{
		{"First pass", fields{DB: gormMock}, args{fileName: "Test"}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			m := &Manager{
				DB: tt.fields.DB,
			}
			if err := m.DeleteFile(tt.args.fileName); (err != nil) != tt.wantErr {
				t.Errorf("Manager.DeleteFile() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
