package ethereum

import (
	"log"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/fatih/color"

	"github.com/databrokerglobal/dxc/database"
)

var contractServed bool = false

// ServeContract Connect to the contract instance
func ServeContract() {

	infuraID, err := database.DBInstance.GetLatestInfuraID()

	if !contractServed && infuraID != "" && err == nil {

		// Create an IPC based RPC connection to a remote node
		conn, err := ethclient.Dial("https://goerli.infura.io/v3/" + infuraID)
		if err != nil {
			log.Printf("Failed to connect to the Ethereum client: %v", err)
			return
		}
		// Instantiate the contract and display its name
		dxc, err := NewEthereum(common.HexToAddress("0x8774f98C752062B6e96E5f5dcDcE011214a8dc1D"), conn)
		if err != nil {
			log.Printf("Failed to instantiate a DXC contract: %v", err)
			return
		}

		color.Cyan(`
		/////////////////////////////////////////////////////////////
		// Connected to the DXC Contract on the Görli Test Network //
		/////////////////////////////////////////////////////////////
		`)

		pp, err := dxc.ProtocolPercentage(nil)
		if err != nil {
			log.Printf("Failed to get protocol percentage: %v", err)
		}

		balance, err := dxc.PlatformBalance(nil)
		if err != nil {
			log.Printf("Failed to get platform balance: %v", err)
		}

		contractServed = true

		color.Yellow("Contract address: 0x8774f98C752062B6e96E5f5dcDcE011214a8dc1D")
		color.Magenta("Current protocol percentage: %d", pp)
		color.Green("Platform balance: %d", balance)
	}
}
