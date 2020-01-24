package products

import (
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/google/uuid"
	"github.com/labstack/echo"
)

// AddOne product
func AddOne(c echo.Context) error {
	p := new(database.Product)

	if err := c.Bind(p); err != nil {
		return err
	}

	if len(p.Name) == 0 {
		return c.String(http.StatusBadRequest, "400: name missing")
	}

	if len(p.Type) == 0 {
		return c.String(http.StatusBadRequest, "400: producttype missing")
	}

	tempuuid, err := uuid.NewRandom()
	if err != nil {
		return err
	}

	p.UUID = tempuuid.String()

	if err := createOneProduct(p); err != nil {
		return err
	}

	return c.JSON(http.StatusCreated, p)
}

// GetOne product
func GetOne(c echo.Context) error {
	uuid := c.Param("uuid")

	p, err := getOneProduct(uuid)

	if err != nil {
		return err
	}
	return c.JSON(http.StatusOK, p)
}
