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
	s.mock.ExpectExec(`INSERT INTO "datasources"`).WithArgs(AnyTime{}, AnyTime{}, nil, datasource.Name, datasource.Type, datasource.Did, datasource.Host, datasource.HeaderAPIKeyName, datasource.HeaderAPIKeyValue, datasource.Available, datasource.Protocol, datasource.Ftpusername, datasource.Ftppassword).WillReturnResult(sqlmock.NewResult(0, 1))
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

func (s *Suite) TestDeleteDatasourceByDID() {

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

	err0 := s.repository.DeleteDatasource(datasource.Did)
	require.NoError(s.T(), err0)

	returnedDatasource2, err2 := s.repository.GetDatasourceByDID(datasource.Did)

	require.NoError(s.T(), err2)
	require.Nil(s.T(), deep.Equal("", returnedDatasource2.Did))
}

func (s *Suite) TestCreateSyncStatus() {

	syncStatus := &SyncStatus{
		Success:    true,
		ErrorResp:  "no message",
		StatusCode: 200,
		Status:     "SUCCESS 200",
	}

	s.mock.ExpectBegin()
	s.mock.ExpectExec(`INSERT INTO "sync_statuses"`).WithArgs(AnyTime{}, AnyTime{}, nil, syncStatus.Success, syncStatus.ErrorResp, syncStatus.StatusCode, syncStatus.Status).WillReturnResult(sqlmock.NewResult(0, 1))
	s.mock.ExpectCommit()

	err := s.repository.CreateSyncStatus(syncStatus.Success, syncStatus.ErrorResp, syncStatus.StatusCode, syncStatus.Status)

	require.NoError(s.T(), err)
}

func (s *Suite) TestSaveNewUserAuth() {

	userAuth := &UserAuth{
		Address: "0x1111",
		APIKey:  "1234",
	}

	s.mock.ExpectBegin()
	s.mock.ExpectExec(`INSERT INTO "user_auths"`).WithArgs(AnyTime{}, AnyTime{}, nil, userAuth.Address, userAuth.APIKey).WillReturnResult(sqlmock.NewResult(0, 1))
	s.mock.ExpectCommit()

	err := s.repository.SaveNewUserAuth(userAuth.Address, userAuth.APIKey)

	require.NoError(s.T(), err)
}

func (s *Suite) TestSaveInstalledVersionInfo() {

	versionInfo := &VersionInfo{
		Version: "1.0.0",
		Checked: "09/01/2021",
		Upgrade: true,
		Latest:  "1.0.1",
	}

	s.mock.ExpectBegin()
	s.mock.ExpectExec(`INSERT INTO "version_infos"`).WithArgs(AnyTime{}, AnyTime{}, nil, versionInfo.Version, versionInfo.Checked, versionInfo.Upgrade, versionInfo.Latest).WillReturnResult(sqlmock.NewResult(0, 1))
	s.mock.ExpectCommit()

	err := s.repository.SaveInstalledVersionInfo(versionInfo.Version, versionInfo.Checked, versionInfo.Upgrade, versionInfo.Latest)

	require.NoError(s.T(), err)
}

func (s *Suite) TestCreateInfuraID() {

	infuraIDObject := &InfuraID{
		InfuraID: "1234",
	}

	s.mock.ExpectBegin()
	s.mock.ExpectExec(`INSERT INTO "infura_ids"`).WithArgs(AnyTime{}, AnyTime{}, nil, infuraIDObject.InfuraID).WillReturnResult(sqlmock.NewResult(0, 1))
	s.mock.ExpectCommit()

	err := s.repository.CreateInfuraID(infuraIDObject.InfuraID)

	require.NoError(s.T(), err)
}

func (s *Suite) TestGetLatestInfuraID() {

	infuraIDObject1 := &InfuraID{
		InfuraID: "1234",
	}
	infuraIDObject2 := &InfuraID{
		InfuraID: "2345",
	}

	s.mock.ExpectQuery(
		regexp.QuoteMeta(
			`SELECT * FROM "infura_ids" WHERE "infura_ids"."deleted_at" IS NULL ORDER BY created_at desc,"infura_ids"."id" ASC LIMIT 1`,
		),
	).WillReturnRows(sqlmock.NewRows([]string{"infura_id"}).AddRow(infuraIDObject1.InfuraID).AddRow(infuraIDObject2.InfuraID))

	returnedInfuraID, err := s.repository.GetLatestInfuraID()

	require.NoError(s.T(), err)
	require.Nil(s.T(), deep.Equal(infuraIDObject2.InfuraID, returnedInfuraID)) // check that the last one is returned (2) not the first one.
}
