package database

import (
	errors "github.com/pkg/errors"
)

// SaveNewUserAuth create a new item
func (m *Manager) SaveNewUserAuth(address string, apiKey string) (err error) {
	userAuth := UserAuth{}
	userAuth.Address = address
	userAuth.APIKey = apiKey

	// Generate new one
	m.DB.Create(&userAuth)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}

	return
}

// GetLatestUserAuth to get the latest item saved
func (m *Manager) GetLatestUserAuth() (u *UserAuth, err error) {
	userAuth := UserAuth{}
	var n int
	m.DB.Table("user_auths").Count(&n)
	if n == 0 {
		return nil, nil
	}
	m.DB.Last(&userAuth)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		return nil, errors.Wrap(errs[0], "error getting latest UserAuth iem")
	}
	return &userAuth, nil
}
