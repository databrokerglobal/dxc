pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol";

contract DXC is Ownable {

  using SafeMath for uint256;
  using SafeMath for uint8;
  using SafeERC20 for ERC20;

  ERC20 public dtxToken;
  uint8 public protocolPercentage = 5;

  constructor(address token) public {
    dtxToken = ERC20(token);
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //// Mofifiers for default settings                                                ////
  ///////////////////////////////////////////////////////////////////////////////////////

  function changeProtocolPercentage(uint8 _protocolPercentage) public onlyOwner {
    protocolPercentage = _protocolPercentage;
  }

  function changeDTXToken(address token) public onlyOwner {
    dtxToken = ERC20(token);
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //// DTX Bank                                                                      ////
  ///////////////////////////////////////////////////////////////////////////////////////

  struct TokenAvailabiltity {
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

  mapping(address => TokenAvailabiltity) public balances;
  uint256 public totalBalance;
  uint256 public totalEscrowed;

  event DepositDTX(address indexed from, uint256 amount);
  event WithdrawDTX(address indexed to, uint256 amount);
  event TransferDTX(address indexed from, address indexed to, uint256 value);

  function platformBalance() public view returns (uint256) {
    return dtxToken.balanceOf(address(this));
  }

  function balanceOf(address owner) public view returns (uint256 balance, uint256 escrowOutgoing, uint256 escrowIncoming, uint256 available) {
    balance = balances[owner].balance;
    escrowOutgoing = balances[owner].escrowOutgoing;
    escrowIncoming = balances[owner].escrowIncoming;
    available = balances[owner].balance.sub(balances[owner].escrowOutgoing);
  }

  function convertFiatToToken(address to, uint256 amount) public onlyOwner {
    balances[to].balance = balances[to].balance.add(amount);
    totalBalance = totalBalance.add(amount);
    emit DepositDTX(to, amount);
  }

  function deposit(uint256 amount) public {
    require(dtxToken.balanceOf(msg.sender) >= amount, "Sender has too little DTX to make this transaction work");
    require(dtxToken.transferFrom(msg.sender, address(this), amount), "DTX transfer failed, probably too little allowance");
    balances[msg.sender].balance = balances[msg.sender].balance.add(amount);
    totalBalance = totalBalance.add(amount);
    emit DepositDTX(msg.sender, amount);
  }

  function withdraw() public {
    (,,, uint256 available) = balanceOf(msg.sender);
    balances[msg.sender].balance = balances[msg.sender].balance.sub(available);
    totalBalance = totalBalance.sub(available);
    require(dtxToken.transfer(msg.sender, available), "Not enough DTX tokens available to withdraw, contact DataBrokerDAO!");
    emit WithdrawDTX(msg.sender, available);
  }

  /**
   * address(0) is the address we use for escrowed funds, they are tracked in escrowedDTX
   */
  function transfer(address from, address to, uint256 amount) internal {
    (,,, uint256 available) = balanceOf(from);
    balances[from].balance = balances[from].balance.sub(amount);
    balances[to].balance = balances[to].balance.add(amount);
    require(amount <= available, "Not enough availalbe DTX to execute this transfer");
    emit TransferDTX(from, to, amount);
  }

  function escrow(
    address owner,
    uint8 ownerPercentage,
    address publisher,
    uint8 publisherPercentage,
    address user,
    address marketplace,
    uint8 marketplacePercentage,
    uint256 amount) internal
  {
    require(ownerPercentage+publisherPercentage+marketplacePercentage+protocolPercentage == 100, "All percentages need to add up to exactly 100");
    balances[user].escrowOutgoing = balances[user].escrowOutgoing.add(amount);
    totalEscrowed = totalEscrowed.add(amount);
    uint256 basePoint = amount.div(100);
    balances[owner].escrowIncoming = balances[owner].escrowIncoming.add(basePoint.mul(ownerPercentage));
    balances[publisher].escrowIncoming = balances[publisher].escrowIncoming.add(basePoint.mul(publisherPercentage));
    balances[marketplace].escrowIncoming = balances[marketplace].escrowIncoming.add(basePoint.mul(marketplacePercentage));
    uint256 protocolAmount = amount.sub((basePoint.mul(ownerPercentage)).add(basePoint.mul(publisherPercentage)).add(basePoint.mul(marketplacePercentage)));
    balances[address(this)].escrowIncoming = balances[address(this)].escrowIncoming.add(protocolAmount);
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //// Deals                                                                         ////
  ///////////////////////////////////////////////////////////////////////////////////////

  struct Deal {
    string did; // the did of the data share in question
    address owner;
    uint8 ownerPercentage;
    address publisher;
    uint8 publisherPercentage;
    address user;
    address marketplace;
    uint8 marketplacePercentage;
    uint256 amount;
    uint256 validFrom; // 0 means forever, all others are a timestamp
    uint256 validUntil; // 0 means forever, all others are a timestamp
  }

  Deal[] public deals;

  mapping(string => uint256) didToIndex;

  event NewDeal(
    uint256 dealIndex,
    string did,
    address owner,
    address publisher,
    address user,
    address marketplace,
    uint256 amount,
    uint256 validFrom,
    uint256 validUntil
  );

  function allDeals() public view returns (Deal[] memory) {
    return deals;
  }

  function deal(string memory did) public view returns (Deal memory){
    return deals[didToIndex[did]];
  }

  function createDeal(
    string memory did,
    address owner,
    uint8 ownerPercentage,
    address publisher,
    uint8 publisherPercentage,
    address user,
    address marketplace,
    uint8 marketplacePercentage,
    uint256 amount,
    uint256 validFrom,
    uint256 validUntil
  ) public onlyOwner {
    escrow(
      owner,
      ownerPercentage,
      publisher,
      publisherPercentage,
      user,
      marketplace,
      marketplacePercentage,
      amount
    );
    uint256 dealIndex = deals.push(Deal(
      did,
      owner,
      ownerPercentage,
      publisher,
      publisherPercentage,
      user,
      marketplace,
      marketplacePercentage,
      amount,
      validFrom,
      validUntil
    )) - 1;
    didToIndex[did] = dealIndex;
    emit NewDeal(
      dealIndex,
      did,
      owner,
      publisher,
      user,
      marketplace,
      amount,
      validFrom,
      validUntil
    );
  }

  function payout(uint256 dealIndex) public {
    Deal memory deal = deals[dealIndex];
    require(now >= deal.validFrom + 14 days, "Payouts can only happen 14 days after the start of the deal (validFrom)");
    // release escrow
    balances[deal.user].escrowOutgoing = balances[deal.user].escrowOutgoing.sub(deal.amount);
    balances[deal.owner].escrowIncoming = balances[deal.owner].escrowIncoming.sub(deal.amount.mul(deal.ownerPercentage).div(100));
    balances[deal.publisher].escrowIncoming = balances[deal.publisher].escrowIncoming.sub(deal.amount.mul(deal.publisherPercentage).div(100));
    balances[deal.marketplace].escrowIncoming = balances[deal.marketplace].escrowIncoming.add(deal.amount.mul(deal.marketplacePercentage).div(100));
    // transfer DTX
    transfer(deal.user, deal.owner, deal.amount.mul(deal.ownerPercentage).div(100));
    transfer(deal.user, deal.publisher, deal.amount.mul(deal.publisherPercentage).div(100));
    transfer(deal.user, deal.marketplace, deal.amount.mul(deal.marketplacePercentage).div(100));
    uint256 protocolAmount = deal.amount.sub((deal.amount.mul(deal.ownerPercentage).div(100)).add(deal.amount.mul(deal.publisherPercentage).div(100)).add(deal.amount.mul(deal.marketplacePercentage).div(100)));
    transfer(deal.user, address(this), protocolAmount);
  }

}
