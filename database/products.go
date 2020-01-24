package database

// CreateProduct Query
func (m *Manager) CreateProduct(p *Product) (err error) {
	m.db.Create(p)
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}

// GetProduct Query
func (m *Manager) GetProduct(u string) (p *Product, err error) {
	product := Product{}
	m.db.Where(&Product{UUID: u}).First(&product)
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &product, nil
}

// GetProducts Get all Products query
func (m *Manager) GetProducts() (ps *[]Product, err error) {
	products := []Product{}
	m.db.Table("Products").Find(&products)
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return &products, nil
}

// DeleteProduct delete a Product
func (m *Manager) DeleteProduct(ProductName string) (err error) {
	m.db.Delete(&Product{Name: ProductName})
	if errs := m.db.GetErrors(); len(errs) > 0 {
		err = errs[0]
	}
	return
}
