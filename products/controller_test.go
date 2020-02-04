package products

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/databrokerglobal/dxc/utils"
	"github.com/labstack/echo"
	"github.com/stretchr/testify/assert"
)

var productJSON = "{\"name\":\"PLC123\",\"producttype\":\"API\",\"uuid\":\"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d\",\"host\":\"http://localhost:3100\"}\n"
var mockDB = map[string]*testProduct{
	"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d": &testProduct{
		Name: "test",
		Type: "FILE",
		Host: "N/A",
		UUID: "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d",
	},
}

func TestAddOneCleanRequest(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/product", strings.NewReader(productJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if assert.NoError(t, MockAddOne(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)
		assert.Equal(t, productJSON, rec.Body.String())
	}
}

type testProduct struct {
	Name string `json:"name"`
	Type string `json:"producttype"`
	UUID string `json:"uuid"`
	Host string `json:"host"`
}

// AddOne product
func MockAddOne(c echo.Context) error {
	p := new(testProduct)

	if err := c.Bind(p); err != nil {
		return err
	}

	if len(p.Name) == 0 {
		return errors.New("empty name")
	}

	if len(p.Type) == 0 {
		return errors.New("empty type")
	}

	if len(p.Host) == 0 {
		return errors.New("empty host")
	}

	if strings.Split(p.Host, "")[len(p.Host)-1] == "/" {
		p.Host = strings.TrimSuffix(p.Host, "/")
	}

	p.UUID = "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d"

	mockDB[p.UUID] = p

	return c.JSON(http.StatusCreated, p)
}

func generateAddOneRequest(jsonString string) echo.Context {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/product", strings.NewReader(jsonString))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	return c
}

func TestMockAddOne(t *testing.T) {

	req1 := generateAddOneRequest("{\"name\":\"PLC123\",\"producttype\":\"API\",\"uuid\":\"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d\",\"host\":\"http://localhost:3100\"}\n")
	req2 := generateAddOneRequest(`{"name":"","producttype":"API","uuid":"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d","host":"http://localhost:3100"}`)
	req3 := generateAddOneRequest(`{"name":"Hello","producttype":"","uuid":"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d","host":"http://localhost:3100"}`)
	req4 := generateAddOneRequest(`{"name":"Hello","producttype":"API","uuid":"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d","host":""}`)
	req5 := generateAddOneRequest(``)

	type args struct {
		c echo.Context
	}

	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"Normal run", args{c: req1}, false},
		{"Empty name", args{c: req2}, true},
		{"Empty type", args{c: req3}, true},
		{"Empty host", args{c: req4}, true},
		{"Empty string", args{c: req5}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := MockAddOne(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("MockAddOne() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func generateGetOneRequest(uuid string) echo.Context {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/product/:uuid")
	c.SetParamNames("uuid")
	c.SetParamValues(uuid)
	return c
}

// GetOne product
func GetOneMock(c echo.Context) error {
	uuid := c.Param("uuid")

	p := mockDB[uuid]

	if p == nil {
		return errors.New("No such product")
	}

	return c.JSON(http.StatusOK, p)
}

func TestGetOneMock(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"Normal run", args{c: generateGetOneRequest("eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d")}, false},
		{"Invalid key", args{c: generateGetOneRequest("eb5cefe0-891c-40c2-a36d-c2d81e1aeb5f")}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := GetOneMock(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("GetOne() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestAddOne(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"First pass", args{generateAddOneRequest("{\"name\":\"PLC123\",\"producttype\":\"API\",\"uuid\":\"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d\",\"host\":\"http://localhost:3100\"}\n")}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := AddOne(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("AddOne() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestGetOne(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"First pass", args{generateGetOneRequest("eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d")}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := GetOne(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("GetOne() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func generateRedirectRequest() echo.Context {
	c := utils.GenerateTestEchoRequest(http.MethodGet, "/eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d", nil)
	return c
}

func TestRedirectToHost(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"First pass", args{generateRedirectRequest()}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := RedirectToHost(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("RedirectToHost() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
