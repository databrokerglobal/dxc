package ethereum

import (
	"errors"
	"log"
	"math/big"

	"github.com/databrokerglobal/dxc/database"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/fatih/color"
)

var (
	contractServed bool = false
	deals          *Ethereum
)

// ServeContract Connect to the contract instance
func ServeContract() {

	infuraID, err := database.DBInstance.GetLatestInfuraID()

	if !contractServed && infuraID != "" && err == nil {

		// Create an IPC based RPC connection to a remote node
		conn, err := ethclient.Dial("https://goerli.infura.io/v3/" + infuraID)
		if err != nil {
			log.Printf("Failed to connect to the Ethereum client: %v", err)
		}
		// Instantiate the contract and display its name
		deals, err = NewEthereum(common.HexToAddress("0x79C16Fa93Dea2F881DA22A9478b214752EFC30FA"), conn)
		if err != nil {
			log.Printf("Failed to instantiate the DXC Deals contract: %v", err)
		}

		color.Cyan(`

///////////////////////////////////////////////////////////////////
// Connected to the DXC Deals Contract on the Görli Test Network //
///////////////////////////////////////////////////////////////////

    `)

		contractServed = true

		color.Yellow("Contract address: 0x79C16Fa93Dea2F881DA22A9478b214752EFC30FA")
	}
}

// HasAccessToDeal check if user has access to a deal
func HasAccessToDeal(index int64, address string) (bool, error) {
	if deals == nil {
		return false, errors.New("Deals contract is not served")
	}

	hasaccess, err := deals.HasAccessToDeal(nil, big.NewInt(index), common.HexToAddress(address))
	if err != nil {
		return false, err
	}

	return hasaccess, nil
}
