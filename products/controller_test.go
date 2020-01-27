package products

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strings"
	"testing"

	"github.com/google/uuid"
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

func TestGetOne(t *testing.T) {
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

// RedirectToHost based on product uuid path check if api or stream and subsequently redirect
func MockRedirectToHost(c echo.Context) (string, error) {
	slice := strings.Split(c.Request().RequestURI, "/")

	var p *testProduct

	// Check if string in path matches uuid regex, is valid uuid and matches product that is type API or STREAM
	for _, str := range slice {

		match, err := regexp.MatchString(`[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}`, str)
		if err != nil {
			return "", c.String(http.StatusNoContent, "")
		}

		if match {
			_, err := uuid.Parse(str)
			if err != nil {
				return "", c.String(http.StatusNoContent, "")
			}

			p = mockDB[str]

			if err != nil {
				return "", c.String(http.StatusNoContent, "")
			}

			if p == nil {
				return "", c.String(http.StatusNoContent, "")
			}

			if p.Type == "FILE" {
				return "", c.String(http.StatusNoContent, "")
			}

			if c.Request().Method == "GET" {
				// replace first encounter of product uuid
				requestURI := strings.Replace(c.Request().RequestURI, p.UUID, "", 1)

				// strip any double slashes, -1 means for every encounter
				strings.Replace(requestURI, "//", "/", -1)

				requestURL := []string{p.Host, requestURI}

				return strings.Join(requestURL, ""), nil
			}
		}
	}

	return "", c.String(http.StatusNoContent, "")
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
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if _, err := MockRedirectToHost(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("RedirectToHost() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
