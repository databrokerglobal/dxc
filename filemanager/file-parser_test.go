package filemanager

import (
	"testing"
)

func Test_compareHashes(t *testing.T) {
	type args struct {
		file1 []byte
		file2 []byte
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{"Case 1: two exact same strings", args{[]byte("test"), []byte("test")}, true},
		{"Case 2: two different strings", args{[]byte("foo"), []byte("bar")}, false},
		{"Case 3: double nil", args{[]byte(nil), []byte(nil)}, true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := CompareHashes(tt.args.file1, tt.args.file2); got != tt.want {
				t.Errorf("compareHashes() = %v, want %v", got, tt.want)
			}
		})
	}
}
