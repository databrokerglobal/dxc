// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package ethereum

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = abi.U256
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// Struct0 is an auto generated low-level Go binding around an user-defined struct.
type Struct0 struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}

// EthereumABI is the input ABI used to generate the binding from.
const EthereumABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"getCurrentIndex\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"initPause\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"name\":\"createDeal\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"unpause\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"blackList\",\"type\":\"address[]\"},{\"name\":\"whiteList\",\"type\":\"address[]\"},{\"name\":\"dealIndex\",\"type\":\"uint256\"}],\"name\":\"addPermissionsToDeal\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"user\",\"type\":\"address\"}],\"name\":\"dealsForAddress\",\"outputs\":[{\"components\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"name\":\"\",\"type\":\"tuple[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"paused\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"initializeOwner\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"},{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"userToDeals\",\"outputs\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"allDeals\",\"outputs\":[{\"components\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"name\":\"\",\"type\":\"tuple[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"didToDeals\",\"outputs\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"pause\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"did\",\"type\":\"string\"}],\"name\":\"dealsForDID\",\"outputs\":[{\"components\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"name\":\"\",\"type\":\"tuple[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"}],\"name\":\"getDealByIndex\",\"outputs\":[{\"components\":[{\"name\":\"did\",\"type\":\"string\"},{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"seller\",\"type\":\"address\"},{\"name\":\"sellerPercentage\",\"type\":\"uint8\"},{\"name\":\"publisher\",\"type\":\"address\"},{\"name\":\"publisherPercentage\",\"type\":\"uint8\"},{\"name\":\"buyer\",\"type\":\"address\"},{\"name\":\"marketplace\",\"type\":\"address\"},{\"name\":\"marketplacePercentage\",\"type\":\"uint8\"},{\"name\":\"amount\",\"type\":\"uint256\"},{\"name\":\"validFrom\",\"type\":\"uint256\"},{\"name\":\"validUntil\",\"type\":\"uint256\"}],\"name\":\"\",\"type\":\"tuple\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"index\",\"type\":\"uint256\"},{\"name\":\"user\",\"type\":\"address\"}],\"name\":\"hasAccessToDeal\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"dxcTokensAddress\",\"type\":\"address\"}],\"name\":\"initialize\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"dealIndex\",\"type\":\"uint256\"}],\"name\":\"payout\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"index\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"did\",\"type\":\"string\"},{\"indexed\":false,\"name\":\"seller\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"publisher\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"buyer\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"marketplace\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"amount\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"validFrom\",\"type\":\"uint256\"},{\"indexed\":false,\"name\":\"validUntil\",\"type\":\"uint256\"}],\"name\":\"NewDeal\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"account\",\"type\":\"address\"}],\"name\":\"Paused\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"account\",\"type\":\"address\"}],\"name\":\"Unpaused\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"}]"

// Ethereum is an auto generated Go binding around an Ethereum contract.
type Ethereum struct {
	EthereumCaller     // Read-only binding to the contract
	EthereumTransactor // Write-only binding to the contract
	EthereumFilterer   // Log filterer for contract events
}

// EthereumCaller is an auto generated read-only Go binding around an Ethereum contract.
type EthereumCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// EthereumTransactor is an auto generated write-only Go binding around an Ethereum contract.
type EthereumTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// EthereumFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type EthereumFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// EthereumSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type EthereumSession struct {
	Contract     *Ethereum         // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// EthereumCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type EthereumCallerSession struct {
	Contract *EthereumCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts   // Call options to use throughout this session
}

// EthereumTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type EthereumTransactorSession struct {
	Contract     *EthereumTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts   // Transaction auth options to use throughout this session
}

// EthereumRaw is an auto generated low-level Go binding around an Ethereum contract.
type EthereumRaw struct {
	Contract *Ethereum // Generic contract binding to access the raw methods on
}

// EthereumCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type EthereumCallerRaw struct {
	Contract *EthereumCaller // Generic read-only contract binding to access the raw methods on
}

// EthereumTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type EthereumTransactorRaw struct {
	Contract *EthereumTransactor // Generic write-only contract binding to access the raw methods on
}

// NewEthereum creates a new instance of Ethereum, bound to a specific deployed contract.
func NewEthereum(address common.Address, backend bind.ContractBackend) (*Ethereum, error) {
	contract, err := bindEthereum(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Ethereum{EthereumCaller: EthereumCaller{contract: contract}, EthereumTransactor: EthereumTransactor{contract: contract}, EthereumFilterer: EthereumFilterer{contract: contract}}, nil
}

// NewEthereumCaller creates a new read-only instance of Ethereum, bound to a specific deployed contract.
func NewEthereumCaller(address common.Address, caller bind.ContractCaller) (*EthereumCaller, error) {
	contract, err := bindEthereum(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &EthereumCaller{contract: contract}, nil
}

// NewEthereumTransactor creates a new write-only instance of Ethereum, bound to a specific deployed contract.
func NewEthereumTransactor(address common.Address, transactor bind.ContractTransactor) (*EthereumTransactor, error) {
	contract, err := bindEthereum(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &EthereumTransactor{contract: contract}, nil
}

// NewEthereumFilterer creates a new log filterer instance of Ethereum, bound to a specific deployed contract.
func NewEthereumFilterer(address common.Address, filterer bind.ContractFilterer) (*EthereumFilterer, error) {
	contract, err := bindEthereum(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &EthereumFilterer{contract: contract}, nil
}

// bindEthereum binds a generic wrapper to an already deployed contract.
func bindEthereum(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(EthereumABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Ethereum *EthereumRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Ethereum.Contract.EthereumCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Ethereum *EthereumRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ethereum.Contract.EthereumTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Ethereum *EthereumRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Ethereum.Contract.EthereumTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Ethereum *EthereumCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Ethereum.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Ethereum *EthereumTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ethereum.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Ethereum *EthereumTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Ethereum.Contract.contract.Transact(opts, method, params...)
}

// AllDeals is a free data retrieval call binding the contract method 0x7186320c.
//
// Solidity: function allDeals() constant returns([]Struct0)
func (_Ethereum *EthereumCaller) AllDeals(opts *bind.CallOpts) ([]Struct0, error) {
	var (
		ret0 = new([]Struct0)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "allDeals")
	return *ret0, err
}

// AllDeals is a free data retrieval call binding the contract method 0x7186320c.
//
// Solidity: function allDeals() constant returns([]Struct0)
func (_Ethereum *EthereumSession) AllDeals() ([]Struct0, error) {
	return _Ethereum.Contract.AllDeals(&_Ethereum.CallOpts)
}

// AllDeals is a free data retrieval call binding the contract method 0x7186320c.
//
// Solidity: function allDeals() constant returns([]Struct0)
func (_Ethereum *EthereumCallerSession) AllDeals() ([]Struct0, error) {
	return _Ethereum.Contract.AllDeals(&_Ethereum.CallOpts)
}

// DealsForAddress is a free data retrieval call binding the contract method 0x518f3f06.
//
// Solidity: function dealsForAddress(address user) constant returns([]Struct0)
func (_Ethereum *EthereumCaller) DealsForAddress(opts *bind.CallOpts, user common.Address) ([]Struct0, error) {
	var (
		ret0 = new([]Struct0)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "dealsForAddress", user)
	return *ret0, err
}

// DealsForAddress is a free data retrieval call binding the contract method 0x518f3f06.
//
// Solidity: function dealsForAddress(address user) constant returns([]Struct0)
func (_Ethereum *EthereumSession) DealsForAddress(user common.Address) ([]Struct0, error) {
	return _Ethereum.Contract.DealsForAddress(&_Ethereum.CallOpts, user)
}

// DealsForAddress is a free data retrieval call binding the contract method 0x518f3f06.
//
// Solidity: function dealsForAddress(address user) constant returns([]Struct0)
func (_Ethereum *EthereumCallerSession) DealsForAddress(user common.Address) ([]Struct0, error) {
	return _Ethereum.Contract.DealsForAddress(&_Ethereum.CallOpts, user)
}

// DealsForDID is a free data retrieval call binding the contract method 0x89635756.
//
// Solidity: function dealsForDID(string did) constant returns([]Struct0)
func (_Ethereum *EthereumCaller) DealsForDID(opts *bind.CallOpts, did string) ([]Struct0, error) {
	var (
		ret0 = new([]Struct0)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "dealsForDID", did)
	return *ret0, err
}

// DealsForDID is a free data retrieval call binding the contract method 0x89635756.
//
// Solidity: function dealsForDID(string did) constant returns([]Struct0)
func (_Ethereum *EthereumSession) DealsForDID(did string) ([]Struct0, error) {
	return _Ethereum.Contract.DealsForDID(&_Ethereum.CallOpts, did)
}

// DealsForDID is a free data retrieval call binding the contract method 0x89635756.
//
// Solidity: function dealsForDID(string did) constant returns([]Struct0)
func (_Ethereum *EthereumCallerSession) DealsForDID(did string) ([]Struct0, error) {
	return _Ethereum.Contract.DealsForDID(&_Ethereum.CallOpts, did)
}

// DidToDeals is a free data retrieval call binding the contract method 0x743ebb7f.
//
// Solidity: function didToDeals(string , uint256 ) constant returns(string did, uint256 index, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumCaller) DidToDeals(opts *bind.CallOpts, arg0 string, arg1 *big.Int) (struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}, error) {
	ret := new(struct {
		Did                   string
		Index                 *big.Int
		Seller                common.Address
		SellerPercentage      uint8
		Publisher             common.Address
		PublisherPercentage   uint8
		Buyer                 common.Address
		Marketplace           common.Address
		MarketplacePercentage uint8
		Amount                *big.Int
		ValidFrom             *big.Int
		ValidUntil            *big.Int
	})
	out := ret
	err := _Ethereum.contract.Call(opts, out, "didToDeals", arg0, arg1)
	return *ret, err
}

// DidToDeals is a free data retrieval call binding the contract method 0x743ebb7f.
//
// Solidity: function didToDeals(string , uint256 ) constant returns(string did, uint256 index, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumSession) DidToDeals(arg0 string, arg1 *big.Int) (struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}, error) {
	return _Ethereum.Contract.DidToDeals(&_Ethereum.CallOpts, arg0, arg1)
}

// DidToDeals is a free data retrieval call binding the contract method 0x743ebb7f.
//
// Solidity: function didToDeals(string , uint256 ) constant returns(string did, uint256 index, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumCallerSession) DidToDeals(arg0 string, arg1 *big.Int) (struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}, error) {
	return _Ethereum.Contract.DidToDeals(&_Ethereum.CallOpts, arg0, arg1)
}

// GetCurrentIndex is a free data retrieval call binding the contract method 0x0d9005ae.
//
// Solidity: function getCurrentIndex() constant returns(uint256)
func (_Ethereum *EthereumCaller) GetCurrentIndex(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "getCurrentIndex")
	return *ret0, err
}

// GetCurrentIndex is a free data retrieval call binding the contract method 0x0d9005ae.
//
// Solidity: function getCurrentIndex() constant returns(uint256)
func (_Ethereum *EthereumSession) GetCurrentIndex() (*big.Int, error) {
	return _Ethereum.Contract.GetCurrentIndex(&_Ethereum.CallOpts)
}

// GetCurrentIndex is a free data retrieval call binding the contract method 0x0d9005ae.
//
// Solidity: function getCurrentIndex() constant returns(uint256)
func (_Ethereum *EthereumCallerSession) GetCurrentIndex() (*big.Int, error) {
	return _Ethereum.Contract.GetCurrentIndex(&_Ethereum.CallOpts)
}

// GetDealByIndex is a free data retrieval call binding the contract method 0x96925ae6.
//
// Solidity: function getDealByIndex(uint256 index) constant returns(Struct0)
func (_Ethereum *EthereumCaller) GetDealByIndex(opts *bind.CallOpts, index *big.Int) (Struct0, error) {
	var (
		ret0 = new(Struct0)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "getDealByIndex", index)
	return *ret0, err
}

// GetDealByIndex is a free data retrieval call binding the contract method 0x96925ae6.
//
// Solidity: function getDealByIndex(uint256 index) constant returns(Struct0)
func (_Ethereum *EthereumSession) GetDealByIndex(index *big.Int) (Struct0, error) {
	return _Ethereum.Contract.GetDealByIndex(&_Ethereum.CallOpts, index)
}

// GetDealByIndex is a free data retrieval call binding the contract method 0x96925ae6.
//
// Solidity: function getDealByIndex(uint256 index) constant returns(Struct0)
func (_Ethereum *EthereumCallerSession) GetDealByIndex(index *big.Int) (Struct0, error) {
	return _Ethereum.Contract.GetDealByIndex(&_Ethereum.CallOpts, index)
}

// HasAccessToDeal is a free data retrieval call binding the contract method 0x97c0f8b7.
//
// Solidity: function hasAccessToDeal(uint256 index, address user) constant returns(bool)
func (_Ethereum *EthereumCaller) HasAccessToDeal(opts *bind.CallOpts, index *big.Int, user common.Address) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "hasAccessToDeal", index, user)
	return *ret0, err
}

// HasAccessToDeal is a free data retrieval call binding the contract method 0x97c0f8b7.
//
// Solidity: function hasAccessToDeal(uint256 index, address user) constant returns(bool)
func (_Ethereum *EthereumSession) HasAccessToDeal(index *big.Int, user common.Address) (bool, error) {
	return _Ethereum.Contract.HasAccessToDeal(&_Ethereum.CallOpts, index, user)
}

// HasAccessToDeal is a free data retrieval call binding the contract method 0x97c0f8b7.
//
// Solidity: function hasAccessToDeal(uint256 index, address user) constant returns(bool)
func (_Ethereum *EthereumCallerSession) HasAccessToDeal(index *big.Int, user common.Address) (bool, error) {
	return _Ethereum.Contract.HasAccessToDeal(&_Ethereum.CallOpts, index, user)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Ethereum *EthereumCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "owner")
	return *ret0, err
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Ethereum *EthereumSession) Owner() (common.Address, error) {
	return _Ethereum.Contract.Owner(&_Ethereum.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Ethereum *EthereumCallerSession) Owner() (common.Address, error) {
	return _Ethereum.Contract.Owner(&_Ethereum.CallOpts)
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() constant returns(bool)
func (_Ethereum *EthereumCaller) Paused(opts *bind.CallOpts) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _Ethereum.contract.Call(opts, out, "paused")
	return *ret0, err
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() constant returns(bool)
func (_Ethereum *EthereumSession) Paused() (bool, error) {
	return _Ethereum.Contract.Paused(&_Ethereum.CallOpts)
}

// Paused is a free data retrieval call binding the contract method 0x5c975abb.
//
// Solidity: function paused() constant returns(bool)
func (_Ethereum *EthereumCallerSession) Paused() (bool, error) {
	return _Ethereum.Contract.Paused(&_Ethereum.CallOpts)
}

// UserToDeals is a free data retrieval call binding the contract method 0x655d4ece.
//
// Solidity: function userToDeals(address , uint256 ) constant returns(string did, uint256 index, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumCaller) UserToDeals(opts *bind.CallOpts, arg0 common.Address, arg1 *big.Int) (struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}, error) {
	ret := new(struct {
		Did                   string
		Index                 *big.Int
		Seller                common.Address
		SellerPercentage      uint8
		Publisher             common.Address
		PublisherPercentage   uint8
		Buyer                 common.Address
		Marketplace           common.Address
		MarketplacePercentage uint8
		Amount                *big.Int
		ValidFrom             *big.Int
		ValidUntil            *big.Int
	})
	out := ret
	err := _Ethereum.contract.Call(opts, out, "userToDeals", arg0, arg1)
	return *ret, err
}

// UserToDeals is a free data retrieval call binding the contract method 0x655d4ece.
//
// Solidity: function userToDeals(address , uint256 ) constant returns(string did, uint256 index, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumSession) UserToDeals(arg0 common.Address, arg1 *big.Int) (struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}, error) {
	return _Ethereum.Contract.UserToDeals(&_Ethereum.CallOpts, arg0, arg1)
}

// UserToDeals is a free data retrieval call binding the contract method 0x655d4ece.
//
// Solidity: function userToDeals(address , uint256 ) constant returns(string did, uint256 index, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumCallerSession) UserToDeals(arg0 common.Address, arg1 *big.Int) (struct {
	Did                   string
	Index                 *big.Int
	Seller                common.Address
	SellerPercentage      uint8
	Publisher             common.Address
	PublisherPercentage   uint8
	Buyer                 common.Address
	Marketplace           common.Address
	MarketplacePercentage uint8
	Amount                *big.Int
	ValidFrom             *big.Int
	ValidUntil            *big.Int
}, error) {
	return _Ethereum.Contract.UserToDeals(&_Ethereum.CallOpts, arg0, arg1)
}

// AddPermissionsToDeal is a paid mutator transaction binding the contract method 0x48996c75.
//
// Solidity: function addPermissionsToDeal(address[] blackList, address[] whiteList, uint256 dealIndex) returns()
func (_Ethereum *EthereumTransactor) AddPermissionsToDeal(opts *bind.TransactOpts, blackList []common.Address, whiteList []common.Address, dealIndex *big.Int) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "addPermissionsToDeal", blackList, whiteList, dealIndex)
}

// AddPermissionsToDeal is a paid mutator transaction binding the contract method 0x48996c75.
//
// Solidity: function addPermissionsToDeal(address[] blackList, address[] whiteList, uint256 dealIndex) returns()
func (_Ethereum *EthereumSession) AddPermissionsToDeal(blackList []common.Address, whiteList []common.Address, dealIndex *big.Int) (*types.Transaction, error) {
	return _Ethereum.Contract.AddPermissionsToDeal(&_Ethereum.TransactOpts, blackList, whiteList, dealIndex)
}

// AddPermissionsToDeal is a paid mutator transaction binding the contract method 0x48996c75.
//
// Solidity: function addPermissionsToDeal(address[] blackList, address[] whiteList, uint256 dealIndex) returns()
func (_Ethereum *EthereumTransactorSession) AddPermissionsToDeal(blackList []common.Address, whiteList []common.Address, dealIndex *big.Int) (*types.Transaction, error) {
	return _Ethereum.Contract.AddPermissionsToDeal(&_Ethereum.TransactOpts, blackList, whiteList, dealIndex)
}

// CreateDeal is a paid mutator transaction binding the contract method 0x3ae19474.
//
// Solidity: function createDeal(string did, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil) returns(uint256)
func (_Ethereum *EthereumTransactor) CreateDeal(opts *bind.TransactOpts, did string, seller common.Address, sellerPercentage uint8, publisher common.Address, publisherPercentage uint8, buyer common.Address, marketplace common.Address, marketplacePercentage uint8, amount *big.Int, validFrom *big.Int, validUntil *big.Int) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "createDeal", did, seller, sellerPercentage, publisher, publisherPercentage, buyer, marketplace, marketplacePercentage, amount, validFrom, validUntil)
}

// CreateDeal is a paid mutator transaction binding the contract method 0x3ae19474.
//
// Solidity: function createDeal(string did, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil) returns(uint256)
func (_Ethereum *EthereumSession) CreateDeal(did string, seller common.Address, sellerPercentage uint8, publisher common.Address, publisherPercentage uint8, buyer common.Address, marketplace common.Address, marketplacePercentage uint8, amount *big.Int, validFrom *big.Int, validUntil *big.Int) (*types.Transaction, error) {
	return _Ethereum.Contract.CreateDeal(&_Ethereum.TransactOpts, did, seller, sellerPercentage, publisher, publisherPercentage, buyer, marketplace, marketplacePercentage, amount, validFrom, validUntil)
}

// CreateDeal is a paid mutator transaction binding the contract method 0x3ae19474.
//
// Solidity: function createDeal(string did, address seller, uint8 sellerPercentage, address publisher, uint8 publisherPercentage, address buyer, address marketplace, uint8 marketplacePercentage, uint256 amount, uint256 validFrom, uint256 validUntil) returns(uint256)
func (_Ethereum *EthereumTransactorSession) CreateDeal(did string, seller common.Address, sellerPercentage uint8, publisher common.Address, publisherPercentage uint8, buyer common.Address, marketplace common.Address, marketplacePercentage uint8, amount *big.Int, validFrom *big.Int, validUntil *big.Int) (*types.Transaction, error) {
	return _Ethereum.Contract.CreateDeal(&_Ethereum.TransactOpts, did, seller, sellerPercentage, publisher, publisherPercentage, buyer, marketplace, marketplacePercentage, amount, validFrom, validUntil)
}

// InitPause is a paid mutator transaction binding the contract method 0x106319dc.
//
// Solidity: function initPause() returns()
func (_Ethereum *EthereumTransactor) InitPause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "initPause")
}

// InitPause is a paid mutator transaction binding the contract method 0x106319dc.
//
// Solidity: function initPause() returns()
func (_Ethereum *EthereumSession) InitPause() (*types.Transaction, error) {
	return _Ethereum.Contract.InitPause(&_Ethereum.TransactOpts)
}

// InitPause is a paid mutator transaction binding the contract method 0x106319dc.
//
// Solidity: function initPause() returns()
func (_Ethereum *EthereumTransactorSession) InitPause() (*types.Transaction, error) {
	return _Ethereum.Contract.InitPause(&_Ethereum.TransactOpts)
}

// Initialize is a paid mutator transaction binding the contract method 0xc4d66de8.
//
// Solidity: function initialize(address dxcTokensAddress) returns()
func (_Ethereum *EthereumTransactor) Initialize(opts *bind.TransactOpts, dxcTokensAddress common.Address) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "initialize", dxcTokensAddress)
}

// Initialize is a paid mutator transaction binding the contract method 0xc4d66de8.
//
// Solidity: function initialize(address dxcTokensAddress) returns()
func (_Ethereum *EthereumSession) Initialize(dxcTokensAddress common.Address) (*types.Transaction, error) {
	return _Ethereum.Contract.Initialize(&_Ethereum.TransactOpts, dxcTokensAddress)
}

// Initialize is a paid mutator transaction binding the contract method 0xc4d66de8.
//
// Solidity: function initialize(address dxcTokensAddress) returns()
func (_Ethereum *EthereumTransactorSession) Initialize(dxcTokensAddress common.Address) (*types.Transaction, error) {
	return _Ethereum.Contract.Initialize(&_Ethereum.TransactOpts, dxcTokensAddress)
}

// InitializeOwner is a paid mutator transaction binding the contract method 0x5f53837f.
//
// Solidity: function initializeOwner() returns()
func (_Ethereum *EthereumTransactor) InitializeOwner(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "initializeOwner")
}

// InitializeOwner is a paid mutator transaction binding the contract method 0x5f53837f.
//
// Solidity: function initializeOwner() returns()
func (_Ethereum *EthereumSession) InitializeOwner() (*types.Transaction, error) {
	return _Ethereum.Contract.InitializeOwner(&_Ethereum.TransactOpts)
}

// InitializeOwner is a paid mutator transaction binding the contract method 0x5f53837f.
//
// Solidity: function initializeOwner() returns()
func (_Ethereum *EthereumTransactorSession) InitializeOwner() (*types.Transaction, error) {
	return _Ethereum.Contract.InitializeOwner(&_Ethereum.TransactOpts)
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_Ethereum *EthereumTransactor) Pause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "pause")
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_Ethereum *EthereumSession) Pause() (*types.Transaction, error) {
	return _Ethereum.Contract.Pause(&_Ethereum.TransactOpts)
}

// Pause is a paid mutator transaction binding the contract method 0x8456cb59.
//
// Solidity: function pause() returns()
func (_Ethereum *EthereumTransactorSession) Pause() (*types.Transaction, error) {
	return _Ethereum.Contract.Pause(&_Ethereum.TransactOpts)
}

// Payout is a paid mutator transaction binding the contract method 0xe1152343.
//
// Solidity: function payout(uint256 dealIndex) returns()
func (_Ethereum *EthereumTransactor) Payout(opts *bind.TransactOpts, dealIndex *big.Int) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "payout", dealIndex)
}

// Payout is a paid mutator transaction binding the contract method 0xe1152343.
//
// Solidity: function payout(uint256 dealIndex) returns()
func (_Ethereum *EthereumSession) Payout(dealIndex *big.Int) (*types.Transaction, error) {
	return _Ethereum.Contract.Payout(&_Ethereum.TransactOpts, dealIndex)
}

// Payout is a paid mutator transaction binding the contract method 0xe1152343.
//
// Solidity: function payout(uint256 dealIndex) returns()
func (_Ethereum *EthereumTransactorSession) Payout(dealIndex *big.Int) (*types.Transaction, error) {
	return _Ethereum.Contract.Payout(&_Ethereum.TransactOpts, dealIndex)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_Ethereum *EthereumTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_Ethereum *EthereumSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _Ethereum.Contract.TransferOwnership(&_Ethereum.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_Ethereum *EthereumTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _Ethereum.Contract.TransferOwnership(&_Ethereum.TransactOpts, newOwner)
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_Ethereum *EthereumTransactor) Unpause(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Ethereum.contract.Transact(opts, "unpause")
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_Ethereum *EthereumSession) Unpause() (*types.Transaction, error) {
	return _Ethereum.Contract.Unpause(&_Ethereum.TransactOpts)
}

// Unpause is a paid mutator transaction binding the contract method 0x3f4ba83a.
//
// Solidity: function unpause() returns()
func (_Ethereum *EthereumTransactorSession) Unpause() (*types.Transaction, error) {
	return _Ethereum.Contract.Unpause(&_Ethereum.TransactOpts)
}

// EthereumNewDealIterator is returned from FilterNewDeal and is used to iterate over the raw logs and unpacked data for NewDeal events raised by the Ethereum contract.
type EthereumNewDealIterator struct {
	Event *EthereumNewDeal // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *EthereumNewDealIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EthereumNewDeal)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(EthereumNewDeal)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *EthereumNewDealIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EthereumNewDealIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EthereumNewDeal represents a NewDeal event raised by the Ethereum contract.
type EthereumNewDeal struct {
	Index       *big.Int
	Did         string
	Seller      common.Address
	Publisher   common.Address
	Buyer       common.Address
	Marketplace common.Address
	Amount      *big.Int
	ValidFrom   *big.Int
	ValidUntil  *big.Int
	Raw         types.Log // Blockchain specific contextual infos
}

// FilterNewDeal is a free log retrieval operation binding the contract event 0xc03dfb2e53cc7a9868a03b235858db6648c1e9f761c1756dd70d8c96f10fde95.
//
// Solidity: event NewDeal(uint256 index, string did, address seller, address publisher, address buyer, address marketplace, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumFilterer) FilterNewDeal(opts *bind.FilterOpts) (*EthereumNewDealIterator, error) {

	logs, sub, err := _Ethereum.contract.FilterLogs(opts, "NewDeal")
	if err != nil {
		return nil, err
	}
	return &EthereumNewDealIterator{contract: _Ethereum.contract, event: "NewDeal", logs: logs, sub: sub}, nil
}

// WatchNewDeal is a free log subscription operation binding the contract event 0xc03dfb2e53cc7a9868a03b235858db6648c1e9f761c1756dd70d8c96f10fde95.
//
// Solidity: event NewDeal(uint256 index, string did, address seller, address publisher, address buyer, address marketplace, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumFilterer) WatchNewDeal(opts *bind.WatchOpts, sink chan<- *EthereumNewDeal) (event.Subscription, error) {

	logs, sub, err := _Ethereum.contract.WatchLogs(opts, "NewDeal")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EthereumNewDeal)
				if err := _Ethereum.contract.UnpackLog(event, "NewDeal", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseNewDeal is a log parse operation binding the contract event 0xc03dfb2e53cc7a9868a03b235858db6648c1e9f761c1756dd70d8c96f10fde95.
//
// Solidity: event NewDeal(uint256 index, string did, address seller, address publisher, address buyer, address marketplace, uint256 amount, uint256 validFrom, uint256 validUntil)
func (_Ethereum *EthereumFilterer) ParseNewDeal(log types.Log) (*EthereumNewDeal, error) {
	event := new(EthereumNewDeal)
	if err := _Ethereum.contract.UnpackLog(event, "NewDeal", log); err != nil {
		return nil, err
	}
	return event, nil
}

// EthereumOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the Ethereum contract.
type EthereumOwnershipTransferredIterator struct {
	Event *EthereumOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *EthereumOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EthereumOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(EthereumOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *EthereumOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EthereumOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EthereumOwnershipTransferred represents a OwnershipTransferred event raised by the Ethereum contract.
type EthereumOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address previousOwner, address newOwner)
func (_Ethereum *EthereumFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts) (*EthereumOwnershipTransferredIterator, error) {

	logs, sub, err := _Ethereum.contract.FilterLogs(opts, "OwnershipTransferred")
	if err != nil {
		return nil, err
	}
	return &EthereumOwnershipTransferredIterator{contract: _Ethereum.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address previousOwner, address newOwner)
func (_Ethereum *EthereumFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *EthereumOwnershipTransferred) (event.Subscription, error) {

	logs, sub, err := _Ethereum.contract.WatchLogs(opts, "OwnershipTransferred")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EthereumOwnershipTransferred)
				if err := _Ethereum.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseOwnershipTransferred is a log parse operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address previousOwner, address newOwner)
func (_Ethereum *EthereumFilterer) ParseOwnershipTransferred(log types.Log) (*EthereumOwnershipTransferred, error) {
	event := new(EthereumOwnershipTransferred)
	if err := _Ethereum.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
		return nil, err
	}
	return event, nil
}

// EthereumPausedIterator is returned from FilterPaused and is used to iterate over the raw logs and unpacked data for Paused events raised by the Ethereum contract.
type EthereumPausedIterator struct {
	Event *EthereumPaused // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *EthereumPausedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EthereumPaused)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(EthereumPaused)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *EthereumPausedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EthereumPausedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EthereumPaused represents a Paused event raised by the Ethereum contract.
type EthereumPaused struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterPaused is a free log retrieval operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_Ethereum *EthereumFilterer) FilterPaused(opts *bind.FilterOpts) (*EthereumPausedIterator, error) {

	logs, sub, err := _Ethereum.contract.FilterLogs(opts, "Paused")
	if err != nil {
		return nil, err
	}
	return &EthereumPausedIterator{contract: _Ethereum.contract, event: "Paused", logs: logs, sub: sub}, nil
}

// WatchPaused is a free log subscription operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_Ethereum *EthereumFilterer) WatchPaused(opts *bind.WatchOpts, sink chan<- *EthereumPaused) (event.Subscription, error) {

	logs, sub, err := _Ethereum.contract.WatchLogs(opts, "Paused")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EthereumPaused)
				if err := _Ethereum.contract.UnpackLog(event, "Paused", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParsePaused is a log parse operation binding the contract event 0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258.
//
// Solidity: event Paused(address account)
func (_Ethereum *EthereumFilterer) ParsePaused(log types.Log) (*EthereumPaused, error) {
	event := new(EthereumPaused)
	if err := _Ethereum.contract.UnpackLog(event, "Paused", log); err != nil {
		return nil, err
	}
	return event, nil
}

// EthereumUnpausedIterator is returned from FilterUnpaused and is used to iterate over the raw logs and unpacked data for Unpaused events raised by the Ethereum contract.
type EthereumUnpausedIterator struct {
	Event *EthereumUnpaused // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *EthereumUnpausedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(EthereumUnpaused)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(EthereumUnpaused)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *EthereumUnpausedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *EthereumUnpausedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// EthereumUnpaused represents a Unpaused event raised by the Ethereum contract.
type EthereumUnpaused struct {
	Account common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterUnpaused is a free log retrieval operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_Ethereum *EthereumFilterer) FilterUnpaused(opts *bind.FilterOpts) (*EthereumUnpausedIterator, error) {

	logs, sub, err := _Ethereum.contract.FilterLogs(opts, "Unpaused")
	if err != nil {
		return nil, err
	}
	return &EthereumUnpausedIterator{contract: _Ethereum.contract, event: "Unpaused", logs: logs, sub: sub}, nil
}

// WatchUnpaused is a free log subscription operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_Ethereum *EthereumFilterer) WatchUnpaused(opts *bind.WatchOpts, sink chan<- *EthereumUnpaused) (event.Subscription, error) {

	logs, sub, err := _Ethereum.contract.WatchLogs(opts, "Unpaused")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(EthereumUnpaused)
				if err := _Ethereum.contract.UnpackLog(event, "Unpaused", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseUnpaused is a log parse operation binding the contract event 0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa.
//
// Solidity: event Unpaused(address account)
func (_Ethereum *EthereumFilterer) ParseUnpaused(log types.Log) (*EthereumUnpaused, error) {
	event := new(EthereumUnpaused)
	if err := _Ethereum.contract.UnpackLog(event, "Unpaused", log); err != nil {
		return nil, err
	}
	return event, nil
}
