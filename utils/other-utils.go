package utils

import "strings"

// TrimLastSlash trims the last slash of a url
func TrimLastSlash(host string) (h string) {
	h = host
	for strings.Split(h, "")[len(h)-1] == "/" {
		h = strings.TrimSuffix(h, "/")
	}
	return h
}
