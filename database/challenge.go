package database

import (
	"github.com/databrokerglobal/dxc/utils"
)

// GenerateNewChallenge Query
func (m *Manager) GenerateNewChallenge() (err error) {
	c := Challenge{}
	c.Challenge, err = utils.GenerateRandomStringURLSafe(32)
	if err != nil {
		return err
	}

	// Get old challenge(s)
	var challenges []Challenge
	m.DB.Table("challenges").Find(&challenges)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}

	// Delete all previous challenges
	m.DB.Delete(challenges)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}

	// Generate new one
	m.DB.Create(&c)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// GetCurrentChallenge Query
func (m *Manager) GetCurrentChallenge() (c *Challenge, err error) {
	challenge := Challenge{}
	var n int
	m.DB.Table("challenge").Count(&n)
	if n == 0 {
		m.GenerateNewChallenge()
	}
	m.DB.First(&challenge)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &challenge, nil
}
