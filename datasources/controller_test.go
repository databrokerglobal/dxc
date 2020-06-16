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

	"github.com/databrokerglobal/dxc/database"

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

func Test_checkDatasource(t *testing.T) {
	type args struct {
		datasource *database.Datasource
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{"first pass", args{&database.Datasource{
			Name: "file 1",
			Type: "FILE",
			Host: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls",
		}}, http.StatusContinue},
		{"datasource has empty name", args{&database.Datasource{
			Name: "",
			Type: "FILE",
			Host: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls",
		}}, http.StatusBadRequest},
		{"datasource is of empty type", args{&database.Datasource{
			Name: "file 1",
			Type: "",
			Host: "https://file-examples.com/wp-content/uploads/2017/02/file_example_XLS_10.xls",
		}}, http.StatusBadRequest},
		{"datasource has no host", args{&database.Datasource{
			Name: "file 1",
			Type: "FILE",
			Host: "",
		}}, http.StatusBadRequest},
		{"datasource is nil", args{
			nil,
		}, http.StatusBadRequest},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := checkDatasource(tt.args.datasource); got != tt.want {
				t.Errorf("checkDatasource() = %v, want %v", got, tt.want)
			}
		})
	}
}
