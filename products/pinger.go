package products

import (
	ping "github.com/sparrc/go-ping"
)

// PingHost ping a host
func PingHost(url string) error {
	pinger, err := ping.NewPinger(url)
	if err != nil {
		return err
	}
	pinger.Count = 3
	pinger.Run()

	return nil
}
