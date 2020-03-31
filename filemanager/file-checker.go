package filemanager

import (
	"log"

	"github.com/databrokerglobal/dxc/database"
	"github.com/fatih/color"
)

// CheckingFiles Delete files that are not in directory anymore, restore files that were deleted but now back in their directory
func CheckingFiles() {

	color.Magenta("Checking file integrity...")
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

	yellow := color.New(color.FgYellow).SprintFunc()

	defer color.Green("Finished checking file integrity %s", yellow("\nCurrent file count: ", len(*files)))
}
