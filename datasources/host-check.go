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
	"github.com/pkg/sftp"
	"golang.org/x/crypto/ssh"
)

// CheckHost check for a host resp
func CheckHost(did string) {

	color.Cyan("Verifying API/Stream status...")

	datasources, err := database.DBInstance.GetDatasources()
	if err != nil {
		log.Fatal(err)
	}

	if len(*datasources) > 0 {
		for _, datasource := range *datasources {
			if did != "" && did != datasource.Did {
				// need to check availibity of only newly added datasource so skip all other datasources
				continue
			}
			notfounderror := errors.New("No file found. Please check filename or path")
			if datasource.Host != "" && datasource.Host != "N/A" && datasource.Name != "" {
				if datasource.Protocol == "LOCAL" {
					path := strings.Replace(datasource.Host, "file://", "", -1)
					_, notfounderror = os.Stat(path)
				} else if datasource.Type == "API" || datasource.Protocol == "HTTP" || datasource.Protocol == "HTTPS" {
					// note we are checking API HOST also as protocol used is HTTP/HTTPS for those datasources
					_, notfounderror = http.Get(datasource.Host)
				} else if datasource.Protocol == "FTP" || datasource.Protocol == "FTPS" {
					filename := path.Base(datasource.Host)
					// get server address and path of file
					server, path, err := getFtpServer(datasource.Protocol, datasource.Host, filename)
					// get client of ftp server
					client, err := ftp.Dial(server)
					if err == nil {
						// now connect to server
						err := client.Login(datasource.Ftpusername, datasource.Ftppassword)
						// Close connection
						defer client.Quit()
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
				} else if datasource.Protocol == "SFTP" {
					filename := path.Base(datasource.Host)
					// get server address and path of file
					server, path, err := getFtpServer(datasource.Protocol, datasource.Host, filename)
					// get client of ftp server
					config := &ssh.ClientConfig{
						User: datasource.Ftpusername,
						Auth: []ssh.AuthMethod{
							ssh.Password(datasource.Ftppassword),
						},
						HostKeyCallback: ssh.InsecureIgnoreHostKey(),
						//Ciphers: []string{"3des-cbc", "aes256-cbc", "aes192-cbc", "aes128-cbc"},
					}
					conn, err := ssh.Dial("tcp", server, config)
					if err == nil {
						client, err := sftp.NewClient(conn)
						// Close connection
						defer client.Close()
						defer conn.Close()
						if err == nil {
							// change directory to path
							cwd, err := client.ReadDir(path) // []os.FileInfo
							if err == nil {
								if contains(cwd, filename) {
									notfounderror = nil
								}
							}
						}
					}
				} else {
					// future implementation dataosurce with streams or other protocols
				}
				datasource.Available = notfounderror == nil
				database.DBInstance.UpdateDatasource(&datasource)
			}
		}
	}

	green := color.New(color.FgHiGreen).SprintFunc()

	defer color.White("Finished checking datasource liveness %s", green("\nCurrent datasource count: ", len(*datasources)))
}

func contains(arr []os.FileInfo, str string) bool {
	for _, a := range arr {
		if a.Name() == str {
			return true
		}
	}
	return false
}
