package database

import (
	"github.com/databrokerglobal/dxc/utils"
)

// GetNewChallenge Query
func (m *Manager) GetNewChallenge() (challenge *Challenge, err error) {
	challenge = new(Challenge)
	challenge.Challenge, err = utils.GenerateRandomStringURLSafe(32)
	if err != nil {
		return nil, err
	}

	if err := m.DB.Create(&challenge).Error; err != nil {
		return nil, err
	}

	return
}
