package datasources

import (
	"log"
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/fatih/color"
)

// CheckHost check for a host resp
func CheckHost() {

	color.Cyan("Verifying API/Stream status...")

	datasources, err := database.DBInstance.GetDatasources()
	if err != nil {
		log.Fatal(err)
	}

	if len(*datasources) > 0 {
		for _, datasource := range *datasources {
			if datasource.Host != "" && datasource.Host != "N/A" && datasource.Name != "" {
				_, err = http.Get(datasource.Host)
				datasource.Available = err == nil
				database.DBInstance.UpdateDatasource(&datasource)
			}
		}
	}

	green := color.New(color.FgHiGreen).SprintFunc()

	defer color.White("Finished checking datasource liveness %s", green("\nCurrent datasource count: ", len(*datasources)))
}
