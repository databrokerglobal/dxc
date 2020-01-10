package filemanager

import "github.com/databrokerglobal/dxc/database"

func getOneFile(name string) (*database.File, error) {
	f, err := database.DB.GetFile(name)
	if err != nil {
		return nil, err
	}
	return f, nil
}

func createOneFile(f *database.File) error {
	if err := database.DB.CreateFile(f); err != nil {
		return err
	}
	return nil
}
