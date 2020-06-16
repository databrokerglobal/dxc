package usermanager

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"testing"

	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
)

func TestMain(m *testing.M) {

	RunningTest = true

	os.Exit(m.Run())
}

func generateSaveUserAuthRequest(address string, apiKey string) echo.Context {
	e := echo.New()
	// query params
	q := make(url.Values)
	if address != "" {
		q.Set("address", address)
	}
	if apiKey != "" {
		q.Set("apiKey", apiKey)
	}

	req := httptest.NewRequest(http.MethodPost, "/?"+q.Encode(), nil)
	rec := httptest.NewRecorder()
	c := e.NewContext(req, rec)

	return c
}

func TestSaveUserAuth(t *testing.T) {
	tests := []struct {
		nameTest         string
		address          string
		apiKey           string
		expectedHTTPCode int
	}{
		{
			"OK",
			"0x2f112ad225E011f067b2E456532918E6D679F978",
			"eyJrIjoiNmEyMWNmZGU1ZjI3YTdjZjViOWIxOGVjIiwiaCI6Imh0dHA6Ly8xMC4wLjAuMTU6ODA4MSJ9",
			http.StatusAccepted,
		},
		{
			"missing address",
			"",
			"eyJrIjoiNmEyMWNmZGU1ZjI3YTdjZjViOWIxOGVjIiwiaCI6Imh0dHA6Ly8xMC4wLjAuMTU6ODA4MSJ9",
			http.StatusBadRequest,
		},
		{
			"missing api key",
			"0x2f112ad225E011f067b2E456532918E6D679F978",
			"",
			http.StatusBadRequest,
		},
	}
	for _, test := range tests {
		t.Run(test.nameTest, func(t *testing.T) {
			c := generateSaveUserAuthRequest(test.address, test.apiKey)
			SaveUserAuth(c)
			assert.Equal(t, test.expectedHTTPCode, c.Response().Status)
		})
	}
}
