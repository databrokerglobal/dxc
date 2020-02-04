package database

// CreateFile Query
func (m *Manager) CreateFile(f *File) (err error) {
	m.DB.Create(f)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// GetFile Query
func (m *Manager) GetFile(n string) (f *File, err error) {
	file := File{}
	m.DB.Where(&File{Name: n}).First(&file)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &file, nil
}

// GetFiles Get all files query
func (m *Manager) GetFiles() (fs *[]File, err error) {
	files := []File{}
	m.DB.Table("files").Find(&files)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &files, nil
}

// DeleteFile delete a file
func (m *Manager) DeleteFile(fileName string) (err error) {
	m.DB.Delete(&File{Name: fileName})
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}
