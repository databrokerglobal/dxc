package datasources

import (
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/databrokerglobal/dxc/database"
	"github.com/fatih/color"
	"github.com/jlaffaye/ftp"
	"github.com/pkg/errors"
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
			notfounderror := errors.New("No file found. Please check filename or path")
			if datasource.Host != "" && datasource.Host != "N/A" && datasource.Name != "" {
				if datasource.Protocol == "LOCAL" {
					path := strings.Replace(datasource.Host, "file://", "", -1)
					_, notfounderror = os.Stat(path)
				} else if datasource.Protocol == "FTP" {
					filename := path.Base(datasource.Host)
					// get server address and path of file
					server, path, err := getFtpServer(datasource.Protocol, datasource.Host, filename)
					// get client of ftp server
					client, err := ftp.Dial(server)
					if err == nil {
						// now connect to server
						err := client.Login(datasource.Ftpusername, datasource.Ftppassword)
						if err == nil {
							// change directory to path
							client.ChangeDir(path)
							// get file entry
							entries, _ := client.List(filename)
							if len(entries) > 0 {
								notfounderror = nil
							}
						}
					}
				} else {
					// check if protocol is HTTP
					_, notfounderror = http.Get(datasource.Host)
				}
				datasource.Available = notfounderror == nil
				database.DBInstance.UpdateDatasource(&datasource)
			}
		}
	}

	green := color.New(color.FgHiGreen).SprintFunc()

	defer color.White("Finished checking datasource liveness %s", green("\nCurrent datasource count: ", len(*datasources)))
}
