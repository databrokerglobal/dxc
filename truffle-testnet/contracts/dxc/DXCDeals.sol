pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "../access/Ownable.sol";

contract DXCDeals is Ownable {
  using SafeMath for uint256;
  using Counters for Counters.Counter;

  Counters.Counter private _dealIndex;
  uint256 private _lockPeriod;
  uint256 private _platformPercentage;
  bool private _initialized;
  uint256[] private _pendingDeals;

  struct Deal {
    string did;
    uint256 dealIndex;
    string buyerId;
    string sellerId;
    address platformAddress;
    uint256 amountInDTX;
    uint256 amountInUSDT;
    uint256 validFrom;
    uint256 validUntil;
    bool accepted;
    bool payoutCompleted;
  }
  Deal[] private _dealsRegistry;
  mapping(string => Deal[]) private _didToDeals;
  mapping(uint256 => Deal) private _dealIndexToDeal;

  modifier isDealIndexValid(uint256 dealIndex) {
    require(dealIndex <= _dealIndex.current(), "DXCDeals: Invalid deal index");
    _;
  }

  event DealCreated(uint256 dealIndex, string did);

  function initialize(uint256 lockPeriod, uint256 platformPercentage) public {
    require(!_initialized, "DXCDeals: Already initialized");
    initializeOwner();
    _lockPeriod = lockPeriod;
    _platformPercentage = platformPercentage;
    _initialized = true;
  }

  function createDeal(
    string memory did,
    string memory buyerId,
    string memory sellerId,
    address platformAddress,
    uint256 amountInUSDT,
    uint256 amountInDTX
  ) public onlyOwner returns (uint256) {
    _dealIndex.increment();
    uint256 dealIndex = _dealIndex.current();

    Deal memory newDeal =
      Deal(
        did,
        dealIndex,
        buyerId,
        sellerId,
        platformAddress,
        amountInDTX,
        amountInUSDT,
        block.timestamp,
        block.timestamp + _lockPeriod,
        true,
        false
      );
    _dealsRegistry.push(newDeal);
    _didToDeals[did].push(newDeal);
    _dealIndexToDeal[dealIndex] = newDeal;
    _pendingDeals.push(dealIndex);

    emit DealCreated(dealIndex, did);

    return dealIndex;
  }

  function declinePayout(uint256 dealIndex)
    public
    onlyOwner
    isDealIndexValid(dealIndex)
  {
    Deal storage deal = _dealIndexToDeal[dealIndex];
    deal.accepted = false;

    removePendingDeal(dealIndex);
  }

  function completePayout(uint256 dealIndex)
    public
    onlyOwner
    isDealIndexValid(dealIndex)
  {
    Deal storage deal = _dealIndexToDeal[dealIndex];
    deal.payoutCompleted = true;

    removePendingDeal(dealIndex);
  }

  function calculateTransferAmount(
    uint256 dealIndex,
    uint256 swappedDTXEst //  _uniswap.getAmountsIn(sellerShareInUSDT, DTXTOUSDT);
  )
    public
    view
    onlyOwner
    isDealIndexValid(dealIndex)
    returns (uint256, uint256)
  {
    Deal memory deal = _dealIndexToDeal[dealIndex];

    require(deal.accepted, "DXCDeals: Deal was declined by the buyer");

    uint256 platformShareInDTX =
      deal.amountInDTX.mul(_platformPercentage).div(100);
    uint256 sellerShareInDTX = deal.amountInDTX - platformShareInDTX;

    // Adjust the DTX tokens that needs to be converted for seller, also adjust the platform commission accordingly
    uint256 sellerTransferAmountInDTX;
    uint256 finalPlatformCommission = 0;
    if (swappedDTXEst > sellerShareInDTX) {
      uint256 extraDTXToBeAdded = swappedDTXEst.sub(sellerShareInDTX);
      sellerTransferAmountInDTX = sellerShareInDTX.add(extraDTXToBeAdded);

      if (platformShareInDTX > extraDTXToBeAdded) {
        finalPlatformCommission = platformShareInDTX.sub(extraDTXToBeAdded);
      }
    } else {
      uint256 extraDTXToBeRemoved = sellerShareInDTX.sub(swappedDTXEst);
      sellerTransferAmountInDTX = sellerShareInDTX.sub(extraDTXToBeRemoved);
      finalPlatformCommission = platformShareInDTX.add(extraDTXToBeRemoved);
    }

    return (sellerTransferAmountInDTX, finalPlatformCommission);
  }

  function removePendingDeal(uint256 dealIndex)
    internal
    isDealIndexValid(dealIndex)
  {
    uint256 atIndex;
    for (uint256 i = 0; i < _pendingDeals.length; i += 1) {
      if (dealIndex == _pendingDeals[i]) {
        atIndex = i;
        break;
      }
    }

    _pendingDeals[atIndex] = _pendingDeals[_pendingDeals.length - 1];
    _pendingDeals.pop();
  }

  function getAllPendingDeals()
    public
    view
    onlyOwner
    returns (uint256[] memory)
  {
    return _pendingDeals;
  }

  function editPlatformPercentage(uint256 platformPercentage) public onlyOwner {
    _platformPercentage = platformPercentage;
  }

  function editLockPeriod(uint256 lockPeriod) public onlyOwner {
    _lockPeriod = lockPeriod;
  }

  function getDealByIndex(uint256 dealIndex) public view returns (Deal memory) {
    return _dealIndexToDeal[dealIndex];
  }

  function getDealsForDID(string memory did)
    public
    view
    returns (Deal[] memory)
  {
    return _didToDeals[did];
  }

  function getAllDeals() public view returns (Deal[] memory) {
    return _dealsRegistry;
  }

  function getPlatformPercentage() public view returns (uint256) {
    return _platformPercentage;
  }

  function getLockPeriod() public view returns (uint256) {
    return _lockPeriod;
  }

  function getCurrentDealIndex() public view returns (uint256) {
    return _dealIndex.current();
  }
}
