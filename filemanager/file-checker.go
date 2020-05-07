package filemanager

import (
	"log"

	"github.com/databrokerglobal/dxc/database"
	"github.com/fatih/color"
)

// CheckingFiles Delete files that are not in directory anymore, restore files that were deleted but now back in their directory
func CheckingFiles() {

	// Fetch all files
	color.Magenta("Checking file integrity...")
	files, err := database.DBInstance.GetFiles()
	if err != nil {
		log.Fatal(err)
	}

	// Update file status
	for _, file := range *files {
		_, err := open(file.Name)
		if err != nil {
			p, err := database.DBInstance.GetProductByID(file.ProductID)
			if err != nil {
				log.Fatal(err)
			}
			p.Status = "UNAVAILABLE"
			if err := database.DBInstance.UpdateProduct(p); err != nil {
				log.Fatal(err)
			}
		} else {
			p, err := database.DBInstance.GetProductByID(file.ProductID)
			if err != nil {
				log.Fatal(err)
			}
			p.Status = "AVAILABLE"
			if err := database.DBInstance.UpdateProduct(p); err != nil {
				log.Fatal(err)
			}
		}
	}

	yellow := color.New(color.FgYellow).SprintFunc()

	defer color.Green("Finished checking file integrity %s", yellow("\nCurrent file count: ", len(*files), "\n"))
}
