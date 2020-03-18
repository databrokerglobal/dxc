pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../ownership/Ownable.sol";


contract DXC is Ownable {
  using SafeMath for uint256;
  using SafeMath for uint8;
  using SafeERC20 for ERC20;

  ERC20 public dtxToken;
  uint8 public protocolPercentage;
  bool private initialized;

  function initialize(address token) public {
    require(!initialized);
    protocolPercentage = 5;
    dtxToken = ERC20(token);
    initializeOwner();
    initialized = true;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //// Blacklist                                                                     ////
  ///////////////////////////////////////////////////////////////////////////////////////

  mapping(address => bool) internal _blackList;

  modifier isNotBlackListed(address user) {
    bool bl = _blackList[user];
    require(!bl);

    _;
  }

  function addToBlackList(address user) public onlyOwner {
    require(!_blackList[user], "User is already blacklisted");
    require(user != owner(), "Owner cannot be blacklisted");
    _blackList[user] = true;
  }

  function removeFromBlackList(address user) public onlyOwner {
    require(_blackList[user], "User is not blacklisted");
    _blackList[user] = false;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //// Mofifiers for default settings                                                ////
  ///////////////////////////////////////////////////////////////////////////////////////

  function changeProtocolPercentage(uint8 _protocolPercentage)
    public
    onlyOwner
  {
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

  function balanceOf(address owner)
    public
    view
    returns (
      uint256 balance,
      uint256 escrowOutgoing,
      uint256 escrowIncoming,
      uint256 available,
      uint256 globalBalance
    )
  {
    balance = balances[owner].balance;
    escrowOutgoing = balances[owner].escrowOutgoing;
    escrowIncoming = balances[owner].escrowIncoming;
    available = balances[owner].balance.sub(balances[owner].escrowOutgoing);
    globalBalance = dtxToken.balanceOf(owner);
  }

  function convertFiatToToken(address to, uint256 amount) public onlyOwner {
    transfer(address(this), to, amount);
    emit DepositDTX(to, amount);
  }

  function deposit(uint256 amount) public isNotBlackListed(msg.sender) {
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

  function platformDeposit(uint256 amount) public onlyOwner {
    balances[address(this)].balance = balances[address(this)].balance.add(
      amount
    );
  }

  function withdraw() public isNotBlackListed(msg.sender) {
    (, , , uint256 available, ) = balanceOf(msg.sender);
    balances[msg.sender].balance = balances[msg.sender].balance.sub(available);
    totalBalance = totalBalance.sub(available);
    require(
      dtxToken.transfer(msg.sender, available),
      "Not enough DTX tokens available to withdraw, contact DataBrokerDAO!"
    );
    emit WithdrawDTX(msg.sender, available);
  }

  function platformTokenWithdraw(uint256 amount) public onlyOwner {
    dtxToken.transfer(owner(), amount);
  }

  function transfer(address from, address to, uint256 amount) internal {
    (, , , uint256 available, ) = balanceOf(from);
    require(
      amount <= available,
      "Not enough available DTX to execute this transfer"
    );
    balances[from].balance = balances[from].balance.sub(amount);
    balances[to].balance = balances[to].balance.add(amount);
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
    uint256 amount
  ) internal {
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

  Deal[] public dealsList;

  mapping(string => Deal[]) public didToDeals;
  mapping(address => Deal[]) public userToDeals;

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

  function allDeals() external view returns (Deal[] memory) {
    return dealsList;
  }

  function deal(uint256 index) external view returns (Deal memory) {
    return dealsList[index];
  }

  function dealsForDID(string calldata did)
    external
    view
    returns (Deal[] memory)
  {
    return didToDeals[did];
  }

  function dealsForAddress(address user) external view returns (Deal[] memory) {
    return userToDeals[user];
  }

  function hasAccessToDiD(string calldata did, address user)
    external
    view
    returns (bool)
  {
    bool accessToDid = false;
    for (uint256 i = 0; i < userToDeals[user].length; i++) {
      if (
        keccak256(abi.encode(userToDeals[user][i].did)) ==
        keccak256(abi.encode(did)) &&
        userToDeals[user][i].validUntil > now
      ) {
        return true;
      }
    }
    return accessToDid;
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
    Deal memory newDeal = Deal(
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
    );
    uint256 dealIndex = dealsList.push(newDeal) - 1;
    didToDeals[did].push(newDeal);
    userToDeals[user].push(newDeal);
    if (owner != user) {
      userToDeals[owner].push(newDeal);
    }
    if (publisher != owner && publisher != user) {
      userToDeals[publisher].push(newDeal);
    }
    if (
      marketplace != owner && marketplace != user && marketplace != publisher
    ) {
      userToDeals[marketplace].push(newDeal);
    }
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
    Deal memory _deal = dealsList[dealIndex];
    require(
      now >= _deal.validFrom + 14 days,
      "Payouts can only happen 14 days after the start of the deal (validFrom)"
    );
    // release escrow
    balances[_deal.user].escrowOutgoing = balances[_deal.user]
      .escrowOutgoing
      .sub(_deal.amount);
    balances[_deal.owner].escrowIncoming = balances[_deal.owner]
      .escrowIncoming
      .sub(_deal.amount.mul(_deal.ownerPercentage).div(100));
    balances[_deal.publisher].escrowIncoming = balances[_deal.publisher]
      .escrowIncoming
      .sub(_deal.amount.mul(_deal.publisherPercentage).div(100));
    balances[_deal.marketplace].escrowIncoming = balances[_deal.marketplace]
      .escrowIncoming
      .add(_deal.amount.mul(_deal.marketplacePercentage).div(100));
    // transfer DTX
    transfer(
      _deal.user,
      _deal.owner,
      _deal.amount.mul(_deal.ownerPercentage).div(100)
    );
    transfer(
      _deal.user,
      _deal.publisher,
      _deal.amount.mul(_deal.publisherPercentage).div(100)
    );
    transfer(
      _deal.user,
      _deal.marketplace,
      _deal.amount.mul(_deal.marketplacePercentage).div(100)
    );
    uint256 protocolAmount = _deal.amount.sub(
      (_deal.amount.mul(_deal.ownerPercentage).div(100))
        .add(_deal.amount.mul(_deal.publisherPercentage).div(100))
        .add(_deal.amount.mul(_deal.marketplacePercentage).div(100))
    );
    transfer(_deal.user, address(this), protocolAmount);
  }
}
