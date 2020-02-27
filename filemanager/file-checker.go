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

	// Start up a go routine for file checking
	go CheckingFiles()
}

// CheckingFiles Delete files that are not in directory anymore, restore files that were deleted but now back in their directory
func CheckingFiles() {

	fmt.Println("Checking file integrity...")
	files, err := database.DBInstance.GetFiles()
	if err != nil {
		log.Fatal(err)
	}
	for _, file := range *files {
		_, err := open(file.Name)
		if err != nil {
			database.DBInstance.DeleteFile(file.Name)
		}
	}

	// Checking if previously deleted files are back up
	var deletedFiles []database.File
	// Unscoped includes soft deleted files in the query
	// Raw allows you to do SQL queries directly
	database.DBInstance.DB.Unscoped().Raw(`SELECT * FROM files WHERE deleted_at IS NOT NULL`).Find(&deletedFiles)

	for _, deletedFile := range deletedFiles {
		_, err = open(deletedFile.Name)
		if err == nil {
			// if file opened successfully remove the soft deletion
			database.DBInstance.DB.Unscoped().Model(&deletedFile).Update("deleted_at", nil)
		}
	}

	defer fmt.Println("Finished checking file integrity")
}
