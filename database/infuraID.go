package database

import errors "github.com/pkg/errors"

// CreateInfuraID Query
func (m *Manager) CreateInfuraID(infuraID string) (err error) {
	infuraIDObject := new(InfuraID)
	infuraIDObject.InfuraID = infuraID
	m.DB.Create(infuraIDObject)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return
}

// GetLatestInfuraID Query
func (m *Manager) GetLatestInfuraID() (infuraID string, err error) {
	infuraIDObject := InfuraID{}
	if m.DB.Order("created_at desc").First(&infuraIDObject).RecordNotFound() {
		return "", errors.New("no record found")
	}
	return infuraIDObject.InfuraID, nil
}
