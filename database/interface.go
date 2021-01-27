package database

import "time"

// Repository inteface
type Repository interface {

	// Challenges
	GetNewChallenge() (c *Challenge, err error)

	// UserAuth
	SaveNewUserAuth(address string, apiKey string) (err error)
	GetLatestUserAuth() (u *UserAuth, err error)

	// VersionInfo
	SaveInstalledVersionInfo(version string, checked string, upgrade bool, latest string) (err error)
	GetInstalledVersionInfo() (u *VersionInfo, err error)
	DeleteInstalledVersionInfo(version string) (err error)
	GetVersionHistory() (u []VersionInfo, err error)
	DeleteVersionHistory() (err error)

	// Datasources
	CreateDatasource(datasource *Datasource) (err error)
	GetDatasourceByDID(did string) (d *Datasource, err error)
	GetDatasources() (ds *[]Datasource, err error)
	DeleteDatasource(did string) (err error)
	UpdateDatasource(datasource *Datasource) (err error)

	// SyncStatus
	CreateSyncStatus(success bool, errorResp string, statusCode int, status string) (err error)
	GetMostRecentSyncStatuses(fromTime time.Time) (syncStatuses []SyncStatus, err error)
	GetAllSyncStatuses() (syncStatuses []SyncStatus, err error)

	// Datasources
	CreateInfuraID(infuraID string) (err error)
	GetLatestInfuraID() (infuraID string, err error)
}
