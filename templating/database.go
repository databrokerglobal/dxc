package templating

import "github.com/databrokerglobal/dxc/database"

func getAllFiles() (*[]database.File, error) {
	files, err := database.DB.GetFiles()
	if err != nil {
		return nil, err
	}
	return files, err
}
