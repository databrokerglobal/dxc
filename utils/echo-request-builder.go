package utils

import (
	"io"
	"net/http/httptest"

	"github.com/labstack/echo/v4"
)

// GenerateTestEchoRequest generate echo request for testing purposes
func GenerateTestEchoRequest(method string, path string, body io.Reader) echo.Context {
	e := echo.New()
	req := httptest.NewRequest(method, path, body)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	return c
}
