package database

import "time"

// CreateSyncStatus Query
func (m *Manager) CreateSyncStatus(success bool, errorResp string, statusCode int, status string) (err error) {
	syncStatus := new(SyncStatus)
	syncStatus.Success = success
	syncStatus.ErrorResp = errorResp
	syncStatus.StatusCode = statusCode
	syncStatus.Status = status
	m.DB.Create(syncStatus)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return
}

// GetMostRecentSyncStatuses Query
// example use: set fromTime to "time.Now().Add(time.Duration(-24) * time.Hour)" to get the last 24 hours
func (m *Manager) GetMostRecentSyncStatuses(fromTime time.Time) (syncStatuses []SyncStatus, err error) {
	m.DB.Where("created_at > ?", fromTime).Find(&syncStatuses)
	return syncStatuses, nil
}

// GetAllSyncStatuses Query
func (m *Manager) GetAllSyncStatuses() (syncStatuses []SyncStatus, err error) {
	m.DB.Find(&syncStatuses)
	return syncStatuses, nil
}
