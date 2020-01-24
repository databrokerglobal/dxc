package products

import "github.com/databrokerglobal/dxc/database"

func getOneProduct(uuid string) (*database.Product, error) {
	p, err := database.DB.GetProduct(uuid)
	if err != nil {
		return nil, err
	}
	return p, nil
}

func createOneProduct(p *database.Product) error {
	if err := database.DB.CreateProduct(p); err != nil {
		return err
	}
	return nil
}
