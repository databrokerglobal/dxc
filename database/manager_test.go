package database

import (
	"reflect"
	"testing"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

func TestNewRepository(t *testing.T) {

	_, gormDB, _ := provideMockDB()

	type args struct {
		db *gorm.DB
	}
	tests := []struct {
		name string
		args args
		want Repository
	}{
		{"First pass", args{db: gormDB}, &Manager{DB: gormDB}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := NewRepository(tt.args.db); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("NewRepository() = %v, want %v", got, tt.want)
			}
		})
	}
}
