package database

import (
	"fmt"

	errors "github.com/pkg/errors"
)

// CreateSentiID Query
func (m *Manager) CreateSentiID(sentiID string) (err error) {
	//fmt.Println("----")
	//fmt.Println("----")
	//fmt.Println("Inside @@@@ " + sentiID)
	sentiIDObject := new(SentiID)
	sentiIDObject.SentiID = sentiID
	m.DB.Create(sentiIDObject)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		//fmt.Println("---- error")
		err = errs[0]
		fmt.Println(err)
		return
	}
	return
}

// GetLatestSentiID Query
func (m *Manager) GetLatestSentiID() (sentiID string, err error) {
	//fmt.Println("----")
	//fmt.Println("----")
	//fmt.Println("Going to get @@@@")
	sentiIDObject := SentiID{}
	if m.DB.Order("created_at desc").First(&sentiIDObject).RecordNotFound() {
		fmt.Println("No found @@@@")
		return "", errors.New("no record found")
	}
	//fmt.Println("OK = " + sentiIDObject.SentiID)
	return sentiIDObject.SentiID, nil
}
