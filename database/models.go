package database

import (
	"github.com/jinzhu/gorm"
)

// Datasource struct
type Datasource struct {
	gorm.Model
	Name              string `json:"name"`
	Type              string `json:"type"`
	Did               string `json:"did"`
	Host              string `json:"host"`
	HeaderAPIKeyName  string `json:"headerAPIKeyName"`
	HeaderAPIKeyValue string `json:"headerAPIKeyValue"`
	Available         bool   `json:"available"`
	Protocol          string `json:"protocol"`
	Ftpusername       string `json:"ftpusername"`
	Ftppassword       string `json:"ftppassword"`
}

// SyncStatus struct
type SyncStatus struct {
	gorm.Model
	Success    bool   `json:"success"`
	ErrorResp  string `json:"errorResp"`
	StatusCode int    `json:"statusCode"`
	Status     string `json:"status"`
}

// Challenge struct
type Challenge struct {
	gorm.Model
	Challenge string `json:"challenge"`
}

// UserAuth struct to
type UserAuth struct {
	gorm.Model
	Address string `json:"address"`
	APIKey  string `json:"api_key"`
}

// VersionInfo struct to
type VersionInfo struct {
	gorm.Model
	Version string `json:"version"`
	Checked string `json:"checked"`
	Upgrade bool   `json:"upgrade"`
	Latest  string `json:"latest"`
}

// InfuraID struct to
type InfuraID struct {
	gorm.Model
	InfuraID string `json:"infuraID"`
}
