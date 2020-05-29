package database

// Repository inteface
type Repository interface {

	// Challenges
	GenerateNewChallenge() (err error)
	GetCurrentChallenge() (c *Challenge, err error)

	// UserAuth
	SaveNewUserAuth(address string, apiKey string) (err error)
	GetLatestUserAuth() (u *UserAuth, err error)

	// Datasources
	CreateDatasource(datasource *Datasource) (err error)
	GetDatasourceByDID(did string) (d *Datasource, err error)
	GetDatasourceByID(id uint) (d *Datasource, err error)
	GetDatasources() (ds *[]Datasource, err error)
	DeleteDatasource(did string) (err error)
	UpdateDatasource(datasource *Datasource) (err error)
}
