package filemanager

import (
	"fmt"
	"log"

	"github.com/databrokerglobal/dxc/database"
)

// Check if file is still on disk, if not delete from
func init() {
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
}
