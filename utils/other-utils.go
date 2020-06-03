package utils

import (
	"errors"
	"net"
	"strings"
)

// GetIPAddress Get ip of this machine
func GetIPAddress() (ip string, err error) {
	if interfaces, err := net.Interfaces(); err == nil {
		for _, interfac := range interfaces {
			if interfac.HardwareAddr.String() != "" {
				if strings.Index(interfac.Name, "en") == 0 ||
					strings.Index(interfac.Name, "eth") == 0 {
					if addrs, err := interfac.Addrs(); err == nil {
						for _, addr := range addrs {
							if addr.Network() == "ip+net" {
								pr := strings.Split(addr.String(), "/")
								if len(pr) == 2 && len(strings.Split(pr[0], ".")) == 4 {
									return pr[0], nil
								}
							}
						}
					}
				}
			}
		}
	}
	return "", errors.New("Could not find local IP address")
}
