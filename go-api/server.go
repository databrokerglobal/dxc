package main

import (
	"github.com/databrokerglobal/dxc/files"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

func main() {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.Static("/", "public")
	e.POST("/upload", files.Upload)

	e.Logger.Fatal(e.Start(":1323"))
}
