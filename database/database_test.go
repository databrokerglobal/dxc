package database

import (
	"database/sql"
	"regexp"
	"testing"

	"github.com/go-test/deep"
	"github.com/jinzhu/gorm"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"gopkg.in/DATA-DOG/go-sqlmock.v1"
)

type Suite struct {
	suite.Suite
	DB   *gorm.DB
	mock sqlmock.Sqlmock

	repository Repository
}

func (s *Suite) SetupSuite() {
	var (
		db  *sql.DB
		err error
	)

	db, s.mock, err = sqlmock.New()
	require.NoError(s.T(), err)

	s.DB, err = gorm.Open("sqlite3", db)
	require.NoError(s.T(), err)

	s.DB.LogMode(true)

	s.repository = NewRepository(s.DB)
}

func (s *Suite) AfterTest(_, _ string) {
	require.NoError(s.T(), s.mock.ExpectationsWereMet())
}

func TestInit(t *testing.T) {
	suite.Run(t, new(Suite))
}

func (s *Suite) TestCreateDatasource() {

	datasource := &Datasource{
		Name:      "Test",
		Type:      "API",
		Did:       "did",
		Host:      "http://localhost:3453",
		Available: true,
	}

	s.mock.ExpectBegin()
	s.mock.ExpectExec(`INSERT INTO "datasources"`).WithArgs(AnyTime{}, AnyTime{}, nil, datasource.Name, datasource.Type, datasource.Did, datasource.Host, datasource.Available).WillReturnResult(sqlmock.NewResult(0, 1))
	s.mock.ExpectCommit()

	err := s.repository.CreateDatasource(datasource)

	require.NoError(s.T(), err)
}

func (s *Suite) TestGetDatasourceByDID() {

	datasource := &Datasource{
		Name:      "Test",
		Type:      "API",
		Did:       "did",
		Host:      "http://localhost:3453",
		Available: true,
	}

	s.mock.ExpectQuery(
		regexp.QuoteMeta(
			`SELECT * FROM "datasources"  WHERE "datasources"."deleted_at" IS NULL AND (("datasources"."did" = ?)) ORDER BY "datasources"."id" ASC LIMIT 1`,
		),
	).WithArgs(datasource.Did).WillReturnRows(sqlmock.NewRows([]string{"name", "type", "did", "host", "available"}).AddRow(datasource.Name, datasource.Type, datasource.Did, datasource.Host, datasource.Available))

	returnedDatasource, err := s.repository.GetDatasourceByDID(datasource.Did)

	require.NoError(s.T(), err)
	require.Nil(s.T(), deep.Equal(datasource, returnedDatasource))
}
