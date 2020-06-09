package syncstatus

import (
	"net/http"
	"time"

	"github.com/databrokerglobal/dxc/database"

	"github.com/labstack/echo/v4"
)

// GetLatestSyncStatuses return all sync statuses of the last 24hrs
// GetLatestSyncStatuses godoc
// @Summary Get all sync statuses of the last 24hrs
// @Description Get all sync statuses of the last 24hrs
// @Tags syncstatus
// @Accept json
// @Produce json
// @Success 200 {array} database.SyncStatus true
// @Failure 500 {string} string "Error retrieving sync statuses from database"
// @Router /syncstatuses/last24h [get]
func GetLatestSyncStatuses(c echo.Context) error {

	syncStatuses, err := database.DBInstance.GetMostRecentSyncStatuses(time.Now().Add(time.Duration(-24) * time.Hour))
	if err != nil {
		return c.String(http.StatusInternalServerError, "Error retrieving sync statuses from database. err: "+err.Error())
	}

	return c.JSON(http.StatusOK, syncStatuses)
}
