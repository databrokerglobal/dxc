package datasources

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"strconv"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {

	RunningTest = true

	os.Exit(m.Run())
}

func generateAddOneDatasourceRequest(t *testing.T, datasource DatasourceReq) echo.Context {
	datasourceJSON, err := json.Marshal(datasource)
	if err != nil {
		t.Fatalf("error marshaling datasource: %s", err.Error())
		return nil
	}
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(string(datasourceJSON)))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)
	return c
}

func TestAddOneDatasource(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		args          args
		wantErr       bool
		requestStatus int
	}{
		{
			args{generateAddOneDatasourceRequest(t, DatasourceReq{
				Name: "file 1",
				Type: "FILE",
				Host: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls",
			}),
			},
			false,
			http.StatusCreated,
		},
		{
			args{generateAddOneDatasourceRequest(t, DatasourceReq{
				Name: "",
				Type: "FILE",
				Host: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls",
			}),
			},
			false,
			http.StatusBadRequest, // missing name
		},
	}
	for i, test := range tests {
		t.Run("case "+strconv.Itoa(i), func(t *testing.T) {
			if (test.wantErr && assert.Error(t, AddOneDatasource(test.args.c))) || assert.NoError(t, AddOneDatasource(test.args.c)) {
				assert.Equal(t, test.args.c.Response().Status, test.requestStatus)
			}
		})
	}
}

func generateDatasourceRequest(includeDid bool, newName string, newHost string) echo.Context {
	e := echo.New()
	// query params
	q := make(url.Values)
	if newName != "" {
		q.Set("newName", newName)
	}
	if newHost != "" {
		q.Set("newHost", newHost)
	}

	req := httptest.NewRequest(http.MethodGet, "/?"+q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	// path params
	if includeDid {
		c.SetPath("/datasource/:did")
		c.SetParamNames("did")
		c.SetParamValues("a did")
	}
	return c
}

func TestGetOneDatasource(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		args          args
		wantErr       bool
		requestStatus int
	}{
		{
			args{generateDatasourceRequest(true, "", "")},
			false,
			http.StatusOK,
		},
		{
			args{generateDatasourceRequest(false, "", "")},
			false,
			http.StatusBadRequest, // missing did
		},
	}
	for i, test := range tests {
		t.Run("case "+strconv.Itoa(i), func(t *testing.T) {
			if (test.wantErr && assert.Error(t, GetOneDatasource(test.args.c))) || assert.NoError(t, GetOneDatasource(test.args.c)) {
				assert.Equal(t, test.args.c.Response().Status, test.requestStatus)
			}
		})
	}
}

func TestAddExampleDatasources(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost, "/", nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	if assert.NoError(t, AddExampleDatasources(c)) {
		assert.Equal(t, http.StatusCreated, rec.Code)
	}
}

func TestDeleteDatasource(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		args          args
		wantErr       bool
		requestStatus int
	}{
		{
			args{generateDatasourceRequest(true, "", "")},
			false,
			200,
		},
		{
			args{generateDatasourceRequest(false, "", "")},
			false,
			400, // bad request, missing did
		},
	}
	for i, test := range tests {
		t.Run("case "+strconv.Itoa(i), func(t *testing.T) {
			if (test.wantErr && assert.Error(t, DeleteDatasource(test.args.c))) || assert.NoError(t, DeleteDatasource(test.args.c)) {
				assert.Equal(t, test.args.c.Response().Status, test.requestStatus)
			}
		})
	}
}

func TestUpdateDatasource(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		args          args
		wantErr       bool
		requestStatus int
	}{
		{
			args{generateDatasourceRequest(true, "a name", "a host")},
			false,
			http.StatusOK,
		},
		{
			args{generateDatasourceRequest(true, "a name", "")},
			false,
			http.StatusOK,
		},
		{
			args{generateDatasourceRequest(true, "", "a host")},
			false,
			http.StatusOK,
		},
		{
			args{generateDatasourceRequest(false, "", "")},
			false,
			http.StatusBadRequest, // missing did
		},
		{
			args{generateDatasourceRequest(true, "", "")},
			false,
			http.StatusBadRequest, // missing newName and newHost
		},
	}
	for i, test := range tests {
		t.Run("case "+strconv.Itoa(i), func(t *testing.T) {
			if (test.wantErr && assert.Error(t, UpdateDatasource(test.args.c))) || assert.NoError(t, UpdateDatasource(test.args.c)) {
				assert.Equal(t, test.args.c.Response().Status, test.requestStatus)
			}
		})
	}
}

// func generateRedirectRequest(method string) echo.Context {
// 	c := utils.GenerateTestEchoRequest(http.MethodGet, "/eb5cefe0-891c-40c2-a36d-c2d81e1aeb3d", nil)
// 	return c
// }

// func TestRedirectToHost(t *testing.T) {
// 	type args struct {
// 		c echo.Context
// 	}
// 	tests := []struct {
// 		name    string
// 		args    args
// 		wantErr bool
// 	}{
// 		{"First pass", args{generateRedirectRequest(http.MethodGet)}, false},
// 		{"Post method", args{generateRedirectRequest(http.MethodPost)}, false},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			if err := RedirectToHost(tt.args.c); (err != nil) != tt.wantErr {
// 				t.Errorf("RedirectToHost() error = %v, wantErr %v", err, tt.wantErr)
// 			}
// 		})
// 	}
// }

// func Test_checkProduct(t *testing.T) {
// 	type args struct {
// 		p *database.Product
// 	}
// 	tests := []struct {
// 		name string
// 		args args
// 		want int
// 	}{
// 		{"first pass", args{p: &database.Product{
// 			Name: "plc number 1231323",
// 			Type: "API",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 100},
// 		{"product has empty name", args{p: &database.Product{
// 			Name: "",
// 			Type: "FILE",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 400},
// 		{"product is of empty type", args{p: &database.Product{
// 			Name: "plc number 1231323",
// 			Type: "",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 400},
// 		{"product has no host", args{p: &database.Product{
// 			Name: "Stuff",
// 			Type: "API",
// 			Did:  "did",
// 			Host: "",
// 		}}, 400},
// 		{"product is nil", args{p: nil}, 400},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			if got := checkProduct(tt.args.p); got != tt.want {
// 				t.Errorf("checkProduct() = %v, want %v", got, tt.want)
// 			}
// 		})
// 	}
// }

// func Test_parseRequestURL(t *testing.T) {
// 	product := database.Product{
// 		Name: "test",
// 		Type: "API",
// 		Did:  "did",
// 		Host: "http://localhost:4000",
// 	}

// 	type args struct {
// 		requestURI string
// 		p          database.Product
// 	}
// 	tests := []struct {
// 		name string
// 		args args
// 		want string
// 	}{
// 		{"First pass", args{
// 			requestURI: fmt.Sprintf("/%s/add", product.Did),
// 			p:          product,
// 		}, "http://localhost:4000/add"},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			if got := parseRequestURL(tt.args.requestURI, &tt.args.p); got != tt.want {
// 				t.Errorf("parseRequestURL() = %v, want %v", got, tt.want)
// 			}
// 		})
// 	}
// }

// func Test_checkProductForRedirect(t *testing.T) {
// 	type args struct {
// 		p *database.Product
// 	}
// 	tests := []struct {
// 		name string
// 		args args
// 		want int
// 	}{
// 		{"first pass", args{p: &database.Product{
// 			Name: "plc number 1231323",
// 			Type: "API",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 100},
// 		{"Is a FILE", args{p: &database.Product{
// 			Name: "plc number 1231323",
// 			Type: "FILE",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 204},
// 		{"product has empty name", args{p: &database.Product{
// 			Name: "",
// 			Type: "FILE",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 204},
// 		{"product is of empty type", args{p: &database.Product{
// 			Name: "plc number 1231323",
// 			Type: "",
// 			Did:  "did",
// 			Host: "http://localhost:4000",
// 		}}, 204},
// 		{"product has no host", args{p: &database.Product{
// 			Name: "Stuff",
// 			Type: "API",
// 			Did:  "did",
// 			Host: "",
// 		}}, 204},
// 		{"product is nil", args{p: nil}, 204},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			if got := checkProductForRedirect(tt.args.p); got != tt.want {
// 				t.Errorf("checkProductForRedirect() = %v, want %v", got, tt.want)
// 			}
// 		})
// 	}
// }

// func Test_buildProxyRequest(t *testing.T) {
// 	type args struct {
// 		c        echo.Context
// 		r        *http.Request
// 		protocol string
// 		host     string
// 	}
// 	tests := []struct {
// 		name string
// 		args args
// 		want *http.Request
// 	}{
// 		{"New host must be correctly allocated to proxied request", args{
// 			c:        utils.GenerateTestEchoRequest(http.MethodGet, "/", nil),
// 			r:        utils.GenerateTestEchoRequest(http.MethodGet, "/", nil).Request(),
// 			protocol: "http",
// 			host:     "localhost:4000",
// 		}, utils.GenerateTestEchoRequest(http.MethodGet, "/", nil).Request()},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			got := buildProxyRequest(tt.args.c, tt.args.r, tt.args.protocol, tt.args.host)
// 			if got.URL.Host != tt.args.host {
// 				t.Errorf("buildProxyRequest() request host is = %s, want %s", got.URL.Host, tt.args.host)
// 			}
// 		})
// 	}
// }
