package database

// CreateProduct Query
func (m *Manager) CreateProduct(p *Product) (err error) {
	m.DB.Create(p)
	if errs := m.DB.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// GetProduct Query
func (m *Manager) GetProduct(u string) (p *Product, err error) {
	product := Product{}
	m.DB.Where(&Product{UUID: u}).First(&product)
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
