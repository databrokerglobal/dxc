package filemanager

import (
	"fmt"
	"log"
	"os"

	"github.com/databrokerglobal/dxc/database"
)

// Check if file is still on disk, if not delete from
func init() {
	if len(os.Args) > 1 && os.Args[1][:5] == "-test" {
		log.Println("Testing: omitting database init")
		return
	}
	fmt.Println("Checking file integrity...")
	files, err := database.DB.GetFiles()
	if err != nil {
		log.Fatal(err)
	}
	for _, file := range *files {
		_, err := open(file.Name)
		if err != nil {
			database.DB.DeleteFile(file.Name)
		}
	}
	defer fmt.Println("Finished checking file integrity")
}
