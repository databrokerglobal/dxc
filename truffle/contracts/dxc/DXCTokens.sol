pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../ownership/Ownable.sol";
import "../ownership/Pausable.sol";
import "@nomiclabs/buidler/console.sol";


contract DXCTokens is Ownable, Pausable {
  using SafeMath for uint256;
  using SafeMath for uint8;
  using SafeERC20 for ERC20;

  ERC20 internal dtxToken;
  uint8 public protocolPercentage;
  bool private initialized;

  address internal _dealContract;

  function initialize(address token, address deal) public whenNotPaused {
    require(!initialized);
    protocolPercentage = 5;
    dtxToken = ERC20(token);
    _dealContract = deal;
    initializeOwner();
    initPause();
    initialized = true;
  }

  function changeProtocolPercentage(uint8 _protocolPercentage) public {
    protocolPercentage = _protocolPercentage;
  }

  function changeDTXToken(address token) public onlyOwner whenNotPaused {
    dtxToken = ERC20(token);
  }

  struct TokenAvailability {
    uint256 balance;
    uint256 escrowOutgoing;
    uint256 escrowIncoming;
  }

  struct Escrow {
    uint256 amount;
    uint256 releaseAfter;
    address to;
    address from;
  }

  mapping(address => TokenAvailability) internal balances;
  uint256 public totalBalance;
  uint256 public totalEscrowed;

  event DepositDTX(address indexed from, uint256 amount);
  event WithdrawDTX(address indexed to, uint256 amount);
  event TransferDTX(address indexed from, address indexed to, uint256 value);

  function balanceOf(address holder)
    public
    view
    whenNotPaused
    returns (
      uint256 balance,
      uint256 escrowOutgoing,
      uint256 escrowIncoming,
      uint256 available,
      uint256 globalBalance
    )
  {
    balance = balances[holder].balance;
    escrowOutgoing = balances[holder].escrowOutgoing;
    escrowIncoming = balances[holder].escrowIncoming;
    available = balance.sub(escrowOutgoing);
    globalBalance = dtxToken.balanceOf(holder);
  }

  function platformBalance() public view whenNotPaused returns (uint256) {
    return dtxToken.balanceOf(address(this));
  }

  function convertFiatToToken(address to, uint256 amount)
    public
    onlyOwner
    whenNotPaused
  {
    transfer(address(this), to, amount);
    emit DepositDTX(to, amount);
  }

  function platformDeposit(uint256 amount) public onlyOwner whenNotPaused {
    balances[address(this)].balance = balances[address(this)].balance.add(
      amount
    );
  }

  function deposit(uint256 amount) public whenNotPaused {
    require(
      dtxToken.balanceOf(msg.sender) >= amount,
      "Sender has too little DTX to make this transaction work"
    );
    require(
      dtxToken.transferFrom(msg.sender, address(this), amount),
      "DTX transfer failed, probably too little allowance"
    );
    balances[msg.sender].balance = balances[msg.sender].balance.add(amount);
    totalBalance = totalBalance.add(amount);
    emit DepositDTX(msg.sender, amount);
  }

  function withdraw() public whenNotPaused {
    (, , , uint256 available, ) = balanceOf(msg.sender);
    balances[msg.sender].balance = balances[msg.sender].balance.sub(available);
    totalBalance = totalBalance.sub(available);
    require(
      dtxToken.transfer(msg.sender, available),
      "Not enough DTX tokens available to withdraw, contact DataBrokerDAO!"
    );
    emit WithdrawDTX(msg.sender, available);
  }

  function transfer(
    address from,
    address to,
    uint256 amount
  ) internal whenNotPaused {
    (, , , uint256 available, ) = balanceOf(from);
    require(
      amount <= available,
      "Not enough available DTX to execute this transfer"
    );
    balances[from].balance = balances[from].balance.sub(amount);
    balances[to].balance = balances[to].balance.add(amount);
    emit TransferDTX(from, to, amount);
  }

  function transferEx(
    address from,
    address to,
    uint256 amount
  ) public whenNotPaused {
    require(msg.sender == _dealContract, "Sender is not _dealContract");
    (, , , uint256 available, ) = balanceOf(from);
    require(
      amount <= available,
      "Not enough available DTX to execute this transfer"
    );
    balances[from].balance = balances[from].balance.sub(amount);
    balances[to].balance = balances[to].balance.add(amount);
    emit TransferDTX(from, to, amount);
  }

  function releaseEscrow(
    address buyer,
    address seller,
    address publisher,
    address marketplace,
    uint256 amount,
    uint8 sellerpct,
    uint8 publisherpct,
    uint8 marketplacepct
  ) external {
    require(msg.sender == _dealContract, "msg.sender is not the deal contract");
    balances[buyer].escrowOutgoing = balances[buyer].escrowOutgoing.sub(amount);
    balances[seller].escrowIncoming = balances[seller].escrowIncoming.sub(
      amount.mul(sellerpct).div(100)
    );
    balances[publisher].escrowIncoming = balances[publisher].escrowIncoming.sub(
      amount.mul(publisherpct).div(100)
    );
    balances[marketplace].escrowIncoming = balances[marketplace]
      .escrowIncoming
      .add(amount.mul(marketplacepct).div(100));
  }

  function escrow(
    address owner,
    uint8 ownerPercentage,
    address publisher,
    uint8 publisherPercentage,
    address user,
    address marketplace,
    uint8 marketplacePercentage,
    uint256 amount
  ) public whenNotPaused {
    require(msg.sender == _dealContract, "Sender is not _dealContract");
    require(
      ownerPercentage +
        publisherPercentage +
        marketplacePercentage +
        protocolPercentage ==
        100,
      "All percentages need to add up to exactly 100"
    );
    balances[user].escrowOutgoing = balances[user].escrowOutgoing.add(amount);
    totalEscrowed = totalEscrowed.add(amount);
    uint256 basePoint = amount.div(100);
    balances[owner].escrowIncoming = balances[owner].escrowIncoming.add(
      basePoint.mul(ownerPercentage)
    );
    balances[publisher].escrowIncoming = balances[publisher].escrowIncoming.add(
      basePoint.mul(publisherPercentage)
    );
    balances[marketplace].escrowIncoming = balances[marketplace]
      .escrowIncoming
      .add(basePoint.mul(marketplacePercentage));
    uint256 protocolAmount = amount.sub(
      (basePoint.mul(ownerPercentage))
        .add(basePoint.mul(publisherPercentage))
        .add(basePoint.mul(marketplacePercentage))
    );
    balances[address(this)].escrowIncoming = balances[address(this)]
      .escrowIncoming
      .add(protocolAmount);
  }
}
