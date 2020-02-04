package templating

import (
	"html/template"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/databrokerglobal/dxc/utils"
	"github.com/labstack/echo"
)

func generateIndexRequest() echo.Context {
	e := echo.New()
	c := utils.GenerateTestEchoRequest(http.MethodGet, "/", nil)
	req := c.Request()
	rec := httptest.NewRecorder()
	testTemplate, _ := template.New("foo").Parse(`{{define "data"}}
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="utf-8" />
			<title>Single file upload</title>
		</head>
		<body>
			<h1>DXC</h1>
			<h2>Upload single file</h2>

			<form action="/upload" method="post" enctype="multipart/form-data">
				<input type="file" name="file" /><br /><br />
				<input type="submit" value="Submit" />
			</form>

			<h2>Files</h2>
			{{if .Files}}
			<ul>
				{{range .Files}}
				<li><a href="/download?name={{.Name}}">{{ .Name }}</a></li>
				{{end}}
			</ul>
			{{else}}
			<p>No files</p>
			{{end}}
		</body>
	</html>
	{{end}}
	`)

	t := &Template{
		Templates: testTemplate,
	}
	e.Renderer = t
	c = e.NewContext(req, rec)
	return c
}

func TestIndexHandler(t *testing.T) {
	type args struct {
		c echo.Context
	}
	tests := []struct {
		name    string
		args    args
		wantErr bool
	}{
		{"First case", args{generateIndexRequest()}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if err := IndexHandler(tt.args.c); (err != nil) != tt.wantErr {
				t.Errorf("IndexHandler() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
