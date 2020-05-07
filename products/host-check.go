package products

import (
	"log"
	"net/http"

	"github.com/databrokerglobal/dxc/database"
	"github.com/fatih/color"
)

// CheckHost check for a host resp
func CheckHost() {

	color.Cyan("Verifying API/Stream status...")

	ps, err := database.DBInstance.GetProducts()
	if err != nil {
		log.Fatal(err)
	}

	for _, p := range *ps {
		_, err = http.Get(p.Host)
		if err != nil {
			p.Status = "UNAVAILABLE"
		} else {
			p.Status = "AVAILABLE"
		}
		database.DBInstance.UpdateProduct(&p)
	}

	yellow := color.New(color.FgHiGreen).SprintFunc()

	defer color.White("Finished checking product liveness %s", yellow("\nCurrent product count: ", len(*ps)))
}
