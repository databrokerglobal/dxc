package products

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/databrokerglobal/dxc/database"
	"github.com/databrokerglobal/dxc/utils"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

var productJSON = "{\"name\":\"PLC123\",\"producttype\":\"API\",\"did\":\"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d\",\"host\":\"http://localhost:3100\"}\n"
var mockDB = map[string]*testProduct{
	"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d": &testProduct{
		Name: "test",
		Type: "FILE",
		Host: "N/A",
		DID:  "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d",
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
	DID  string `json:"did"`
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

	p.DID = "eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d"

	mockDB[p.DID] = p

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

	req1 := generateAddOneRequest("{\"name\":\"PLC123\",\"producttype\":\"API\",\"did\":\"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d\",\"host\":\"http://localhost:3100\"}\n")
	req2 := generateAddOneRequest(`{"name":"","producttype":"API","did":"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d","host":"http://localhost:3100"}`)
	req3 := generateAddOneRequest(`{"name":"Hello","producttype":"","did":"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d","host":"http://localhost:3100"}`)
	req4 := generateAddOneRequest(`{"name":"Hello","producttype":"API","did":"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d","host":""}`)
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

func generateGetOneRequest(did string) echo.Context {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	c.SetPath("/product/:did")
	c.SetParamNames("did")
	c.SetParamValues(did)
	return c
}

// GetOne product
func GetOneMock(c echo.Context) error {
	did := c.Param("did")

	p := mockDB[did]

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
		{"First pass", args{generateAddOneRequest("{\"name\":\"PLC123\",\"producttype\":\"API\",\"did\":\"eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d\",\"host\":\"http://localhost:3100\"}\n")}, false},
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

func generateRedirectRequest(method string) echo.Context {
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
		{"First pass", args{generateRedirectRequest(http.MethodGet)}, false},
		{"Post method", args{generateRedirectRequest(http.MethodPost)}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := RedirectToHost(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("RedirectToHost() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func Test_checkProduct(t *testing.T) {
	type args struct {
		p *database.Product
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{"first pass", args{p: &database.Product{
			Name: "plc number 1231323",
			Type: "API",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 100},
		{"product has empty name", args{p: &database.Product{
			Name: "",
			Type: "FILE",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 400},
		{"product is of empty type", args{p: &database.Product{
			Name: "plc number 1231323",
			Type: "",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 400},
		{"product has no host", args{p: &database.Product{
			Name: "Stuff",
			Type: "API",
			DID:  "did",
			Host: "",
		}}, 400},
		{"product is nil", args{p: nil}, 400},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := checkProduct(tt.args.p); got != tt.want {
				t.Errorf("checkProduct() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_parseRequestURL(t *testing.T) {
	p := utils.MakeProduct("test", "API", "did", "http://localhost:4000")

	type args struct {
		requestURI string
		p          *database.Product
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{"First pass", args{
			requestURI: fmt.Sprintf("/%s/add", p.DID),
			p:          p,
		}, "http://localhost:4000/add"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := parseRequestURL(tt.args.requestURI, tt.args.p); got != tt.want {
				t.Errorf("parseRequestURL() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_checkProductForRedirect(t *testing.T) {
	type args struct {
		p *database.Product
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{"first pass", args{p: &database.Product{
			Name: "plc number 1231323",
			Type: "API",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 100},
		{"Is a FILE", args{p: &database.Product{
			Name: "plc number 1231323",
			Type: "FILE",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 204},
		{"product has empty name", args{p: &database.Product{
			Name: "",
			Type: "FILE",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 204},
		{"product is of empty type", args{p: &database.Product{
			Name: "plc number 1231323",
			Type: "",
			DID:  "did",
			Host: "http://localhost:4000",
		}}, 204},
		{"product has no host", args{p: &database.Product{
			Name: "Stuff",
			Type: "API",
			DID:  "did",
			Host: "",
		}}, 204},
		{"product is nil", args{p: nil}, 204},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := checkProductForRedirect(tt.args.p); got != tt.want {
				t.Errorf("checkProductForRedirect() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_trimLastSlash(t *testing.T) {
	type args struct {
		host string
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{"No trailing slash", args{host: "http://localhost:4000"}, "http://localhost:4000"},
		{"1 trailing slash", args{host: "http://localhost:4000/"}, "http://localhost:4000"},
		{"what are you doing?", args{host: "http://localhost:4000////////"}, "http://localhost:4000"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := trimLastSlash(tt.args.host); got != tt.want {
				t.Errorf("trimLastSlash() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_buildProxyRequest(t *testing.T) {
	type args struct {
		c        echo.Context
		r        *http.Request
		protocol string
		host     string
	}
	tests := []struct {
		name string
		args args
		want *http.Request
	}{
		{"New host must be correctly allocated to proxied request", args{
			c:        utils.GenerateTestEchoRequest(http.MethodGet, "/", nil),
			r:        utils.GenerateTestEchoRequest(http.MethodGet, "/", nil).Request(),
			protocol: "http",
			host:     "localhost:4000",
		}, utils.GenerateTestEchoRequest(http.MethodGet, "/", nil).Request()},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildProxyRequest(tt.args.c, tt.args.r, tt.args.protocol, tt.args.host)
			if got.URL.Host != tt.args.host {
				t.Errorf("buildProxyRequest() request host is = %s, want %s", got.URL.Host, tt.args.host)
			}
		})
	}
}
