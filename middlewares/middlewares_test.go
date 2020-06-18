package middlewares

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

func createRequestToTestDataAccessVerification(dxcAPIKEY string) (e *echo.Echo, req *http.Request, rec *httptest.ResponseRecorder) {

	e = echo.New()
	// set as handler function and server with e.ServerHTTP
	e.GET("/", nil, DataAccessVerification)

	q := make(url.Values)
	if dxcAPIKEY != "" {
		q.Set("DXC_PRODUCT_KEY", dxcAPIKEY)
	}
	req = httptest.NewRequest(echo.GET, "/?"+q.Encode(), nil)
	rec = httptest.NewRecorder()
	return
}

func TestDataAccessVerification(t *testing.T) {

	/*
		working example uses:
		did: did:databroker:file1:FILE:r3DJ-t9pM0Dnvw==
		address: 0x2f112ad225E011f067b2E456532918E6D679F978
		private key: 0xae78c8b502571dba876742437f8bc78b689cf8518356c0921393d89caaf284ce
		challenge: iwJS-aqx7p3bpZ4kyEbb8zmC_BV4VjhjsAiT3tPvAmo=

		correct DXC_PRODUCT_KEY: eyJ1bnNpZ25lZERhdGEiOiJleUprYVdRaU9pSmthV1E2WkdGMFlXSnliMnRsY2pwbWFXeGxNVHBHU1V4Rk9uSXpSRW90ZERsd1RUQkViblozUFQwaUxDSmphR0ZzYkdWdVoyVWlPaUpwZDBwVExXRnhlRGR3TTJKd1dqUnJlVVZpWWpoNmJVTmZRbFkwVm1wb2FuTkJhVlF6ZEZCMlFXMXZQU0lzSW1Ga1pISmxjM01pT2lJd2VESm1NVEV5WVdReU1qVkZNREV4WmpBMk4ySXlSVFExTmpVek1qa3hPRVUyUkRZM09VWTVOemdpZlE9PSIsInNpZ25hdHVyZSI6IjB4NDUyMWRkMjM1OGFiNDlkZTMzZTlkOGYyNmQ2N2E2YzViZTIyMzIzZWRkNWM1NDZhMTkzNDg5NjFiZDM0MDhjMjI3ZDg4N2ZkZTcxYjdhOWFiOGYwOWY2N2ViMWFmMzM5MzE3ZGExN2I4YTI5ZjM5NTVlMzlhN2I1NzhlNmNkNzQwMSIsInB1YmxpY0tleSI6IjB4MDRhN2MzNmY4MDY0ZjJjNDA3NWVkMzhkYjUwOWU0NmJmZDI5ZWJlNzNiYjNjMjNhZmVhYTAzOWVmOGI5ODAzYjkzZmE5NTc5MGNiMzg2YzcyMDRjNDgzYzBjMDU3YzhkMWExYjA4YTUzNmNhZGRjMGM4ZThlMTJkNzJkMjU1OTE2ZCJ9

		decoded key:
		{
			"unsignedData": "eyJkaWQiOiJkaWQ6ZGF0YWJyb2tlcjpmaWxlMTpGSUxFOnIzREotdDlwTTBEbnZ3PT0iLCJjaGFsbGVuZ2UiOiJpd0pTLWFxeDdwM2JwWjRreUViYjh6bUNfQlY0VmpoanNBaVQzdFB2QW1vPSIsImFkZHJlc3MiOiIweDJmMTEyYWQyMjVFMDExZjA2N2IyRTQ1NjUzMjkxOEU2RDY3OUY5NzgifQ==",
			"signature": "0x4521dd2358ab49de33e9d8f26d67a6c5be22323edd5c546a19348961bd3408c227d887fde71b7a9ab8f09f67eb1af339317da17b8a29f3955e39a7b578e6cd7401",
			"publicKey": "0x04a7c36f8064f2c4075ed38db509e46bfd29ebe73bb3c23afeaa039ef8b9803b93fa95790cb386c7204c483c0c057c8d1a1b08a536caddc0c8e8e12d72d255916d"
		}
	*/

	tests := []struct {
		nameTest           string
		dxcAPIKEY          string
		expectedHTTPStatus int
	}{
		{
			"OK",
			"eyJ1bnNpZ25lZERhdGEiOiJleUprYVdRaU9pSmthV1E2WkdGMFlXSnliMnRsY2pwbWFXeGxNVHBHU1V4Rk9uSXpSRW90ZERsd1RUQkViblozUFQwaUxDSmphR0ZzYkdWdVoyVWlPaUpwZDBwVExXRnhlRGR3TTJKd1dqUnJlVVZpWWpoNmJVTmZRbFkwVm1wb2FuTkJhVlF6ZEZCMlFXMXZQU0lzSW1Ga1pISmxjM01pT2lJd2VESm1NVEV5WVdReU1qVkZNREV4WmpBMk4ySXlSVFExTmpVek1qa3hPRVUyUkRZM09VWTVOemdpZlE9PSIsInNpZ25hdHVyZSI6IjB4NDUyMWRkMjM1OGFiNDlkZTMzZTlkOGYyNmQ2N2E2YzViZTIyMzIzZWRkNWM1NDZhMTkzNDg5NjFiZDM0MDhjMjI3ZDg4N2ZkZTcxYjdhOWFiOGYwOWY2N2ViMWFmMzM5MzE3ZGExN2I4YTI5ZjM5NTVlMzlhN2I1NzhlNmNkNzQwMSIsInB1YmxpY0tleSI6IjB4MDRhN2MzNmY4MDY0ZjJjNDA3NWVkMzhkYjUwOWU0NmJmZDI5ZWJlNzNiYjNjMjNhZmVhYTAzOWVmOGI5ODAzYjkzZmE5NTc5MGNiMzg2YzcyMDRjNDgzYzBjMDU3YzhkMWExYjA4YTUzNmNhZGRjMGM4ZThlMTJkNzJkMjU1OTE2ZCJ9",
			http.StatusOK,
		},
		{
			"Base64 encoding not valid",
			"e",
			http.StatusBadRequest,
		},
		{
			"DXC_PRODUCT_KEY is not valid. error finding public key from signature",
			"eyJ1bnNpZ25lZERhdGEiOiJleUprYVdRaU9pSmthV1E2WkdGMFlXSnliMnRsY2pwbWFXeGxNVHBHU1V4Rk9uSXpSRW90ZERsd1RUQkViblozUFQwaUxDSmphR0ZzYkdWdVoyVWlPaUpwZDBwVExXRnhlRGR3TTJKd1dqUnJlVVZpWWpoNmJVTmZRbFkwVm1wb2FuTkJhVlF6ZEZCMlFXMXZQU0lzSW1Ga1pISmxjM01pT2lJd2VESm1NVEV5WVdReU1qVkZNREV4WmpBMk4ySXlSVFExTmpVek1qa3hPRVUyUkRZM09VWTVOemdpZlE9PSIsInNpZ25hdHVyZSI6IjB4NTUyMWRkMjM1OGFiNDlkZTMzZTlkOGYyNmQ2N2E2YzViZTIyMzIzZWRkNWM1NDZhMTkzNDg5NjFiZDM0MDhjMjI3ZDg4N2ZkZTcxYjdhOWFiOGYwOWY2N2ViMWFmMzM5MzE3ZGExN2I4YTI5ZjM5NTVlMzlhN2I1NzhlNmNkNzQwMSIsInB1YmxpY0tleSI6IjB4MDRhN2MzNmY4MDY0ZjJjNDA3NWVkMzhkYjUwOWU0NmJmZDI5ZWJlNzNiYjNjMjNhZmVhYTAzOWVmOGI5ODAzYjkzZmE5NTc5MGNiMzg2YzcyMDRjNDgzYzBjMDU3YzhkMWExYjA4YTUzNmNhZGRjMGM4ZThlMTJkNzJkMjU1OTE2ZCJ9",
			http.StatusBadRequest,
		},
		{
			"signature not valid",
			"eyJ1bnNpZ25lZERhdGEiOiJmeUprYVdRaU9pSmthV1E2WkdGMFlXSnliMnRsY2pwbWFXeGxNVHBHU1V4Rk9uSXpSRW90ZERsd1RUQkViblozUFQwaUxDSmphR0ZzYkdWdVoyVWlPaUpwZDBwVExXRnhlRGR3TTJKd1dqUnJlVVZpWWpoNmJVTmZRbFkwVm1wb2FuTkJhVlF6ZEZCMlFXMXZQU0lzSW1Ga1pISmxjM01pT2lJd2VESm1NVEV5WVdReU1qVkZNREV4WmpBMk4ySXlSVFExTmpVek1qa3hPRVUyUkRZM09VWTVOemdpZlE9PSIsInNpZ25hdHVyZSI6IjB4NDUyMWRkMjM1OGFiNDlkZTMzZTlkOGYyNmQ2N2E2YzViZTIyMzIzZWRkNWM1NDZhMTkzNDg5NjFiZDM0MDhjMjI3ZDg4N2ZkZTcxYjdhOWFiOGYwOWY2N2ViMWFmMzM5MzE3ZGExN2I4YTI5ZjM5NTVlMzlhN2I1NzhlNmNkNzQwMSIsInB1YmxpY0tleSI6IjB4MDRhN2MzNmY4MDY0ZjJjNDA3NWVkMzhkYjUwOWU0NmJmZDI5ZWJlNzNiYjNjMjNhZmVhYTAzOWVmOGI5ODAzYjkzZmE5NTc5MGNiMzg2YzcyMDRjNDgzYzBjMDU3YzhkMWExYjA4YTUzNmNhZGRjMGM4ZThlMTJkNzJkMjU1OTE2ZCJ9",
			http.StatusUnauthorized,
		},
		{
			"DXC_PRODUCT_KEY not provided",
			"",
			http.StatusUnauthorized,
		},
	}
	for _, test := range tests {
		t.Run(test.nameTest, func(t *testing.T) {
			e, req, rec := createRequestToTestDataAccessVerification(test.dxcAPIKEY)
			e.ServeHTTP(rec, req)
			assert.Equal(t, test.expectedHTTPStatus, rec.Code)
		})
	}
}