package utils

import (
	"testing"
)

func TestTrimLastSlash(t *testing.T) {

	tables := []struct {
		input  string
		output string
	}{
		{
			"http://settlemint.com",
			"http://settlemint.com",
		},
		{
			"http://settlemint.com/",
			"http://settlemint.com",
		},
	}

	for i, table := range tables {
		output := TrimLastSlash(table.input)
		if output != table.output {
			t.Errorf("case %d: Result should be %s but is %s.", i, table.output, output)
		}
	}
}
