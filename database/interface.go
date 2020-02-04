package database

// Repository inteface
type Repository interface {
	CreateFile(f *File) (err error)
	GetFile(n string) (f *File, err error)
	GetFiles() (fs *[]File, err error)
	DeleteFile(fileName string) (err error)
	CreateProduct(p *Product) (err error)
	GetProduct(u string) (p *Product, err error)
	GetProducts() (ps *[]Product, err error)
	DeleteProduct(ProductName string) (err error)
}
