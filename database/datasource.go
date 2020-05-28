package database

import errors "github.com/pkg/errors"

// CreateDatasource Query
func (m *Manager) CreateDatasource(datasource *Datasource) (err error) {
	m.DB.Create(datasource)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return
}

// GetDatasourceByDID Query
func (m *Manager) GetDatasourceByDID(did string) (d *Datasource, err error) {
	datasource := Datasource{}
	if m.DB.Where(&Datasource{Did: did}).First(&datasource).RecordNotFound() {
		return nil, errors.New("record not found")
	}
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return &datasource, nil
}

// GetDatasourceByID Query
func (m *Manager) GetDatasourceByID(id uint) (d *Datasource, err error) {
	datasource := Datasource{}
	if m.DB.Preload("Files").Where("id = ?", id).First(&datasource).RecordNotFound() {
		return nil, errors.New("record not found")
	}
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return &datasource, nil
}

// GetDatasources Get all Datasources query
func (m *Manager) GetDatasources() (ds *[]Datasource, err error) {
	datasources := []Datasource{}
	m.DB.Table("Datasources").Find(&datasources)
	return &datasources, nil
}

// DeleteDatasource delete a Datasource
func (m *Manager) DeleteDatasource(did string) (err error) {
	m.DB.Delete(&Datasource{Did: did})
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return
}

// UpdateDatasource update a datasource entry
func (m *Manager) UpdateDatasource(datasource *Datasource) (err error) {
	m.DB.Save(datasource)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
		return
	}
	return
}
