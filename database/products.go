package database

// CreateProduct Query
func (m *Manager) CreateProduct(p *Product) (err error) {
	m.DB.Create(p)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// GetProductByDID Query
func (m *Manager) GetProductByDID(d string) (p *Product, err error) {
	product := Product{}
	m.DB.Where(&Product{Did: d}).First(&product)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &product, nil
}

// GetProductByID Query
func (m *Manager) GetProductByID(id uint) (p *Product, err error) {
	product := Product{}
	m.DB.Where("id = ?", id).First(&product)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &product, nil
}

// GetProducts Get all Products query
func (m *Manager) GetProducts() (ps *[]Product, err error) {
	products := []Product{}
	m.DB.Table("Products").Preload("Files").Find(&products)
	return &products, nil
}

// DeleteProduct delete a Product
func (m *Manager) DeleteProduct(ProductName string) (err error) {
	m.DB.Delete(&Product{Name: ProductName})
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// UpdateProduct update a product entry
func (m *Manager) UpdateProduct(p *Product) (err error) {
	m.DB.Save(p)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}
