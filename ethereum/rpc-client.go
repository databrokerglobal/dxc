package ethereum

import (
	"log"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/fatih/color"
)

// ServeContract Connect to the contract instance
func ServeContract() {
	infuraID := "1d27961a0ea644ae824620ccfab9c9fa"

	// Create an IPC based RPC connection to a remote node
	conn, err := ethclient.Dial("https://goerli.infura.io/v3/" + infuraID)
	if err != nil {
		log.Fatalf("Failed to connect to the Ethereum client: %v", err)
	}
	// Instantiate the contract and display its name
	dxc, err := NewEthereum(common.HexToAddress("0x8774f98C752062B6e96E5f5dcDcE011214a8dc1D"), conn)
	if err != nil {
		log.Fatalf("Failed to instantiate a DXC contract: %v", err)
	}

	color.Cyan(`
  /////////////////////////////////////////////////////////////
  // Connected to the DXC Contract on the Görli Test Network //
  /////////////////////////////////////////////////////////////
  `)

	pp, err := dxc.ProtocolPercentage(nil)
	if err != nil {
		log.Fatalf("Failed to get protocol percentage: %v", err)
	}

	balance, err := dxc.PlatformBalance(nil)
	if err != nil {
		log.Fatalf("Failed to get platform balance: %v", err)
	}

	color.Yellow("Contract address: 0x8774f98C752062B6e96E5f5dcDcE011214a8dc1D")
	color.Magenta("Current protocol percentage: %d", pp)
	color.Green("Platform balance: %d", balance)

}
