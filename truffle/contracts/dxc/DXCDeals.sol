pragma solidity ^0.5.7;
pragma experimental ABIEncoderV2;

import "./DXCTokens.sol";
import "../ownership/Ownable.sol";
import "../ownership/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


contract DXCDeals is Ownable, Pausable {
  DXCTokens internal dxcTokens;
  bool private initialized;
  using SafeMath for uint256;
  using SafeMath for uint8;

  function initialize(address dxcTokensAddress) public whenNotPaused {
    require(!initialized);
    dxcTokens = DXCTokens(dxcTokensAddress);
    initializeOwner();
    initPause();
    initialized = true;
  }

  struct TokenAvailability {
    uint256 balance;
    uint256 escrowOutgoing;
    uint256 escrowIncoming;
  }

  struct Deal {
    string did; // the did of the data share in question
    uint256 index;
    address seller;
    uint8 sellerPercentage;
    address publisher;
    uint8 publisherPercentage;
    address buyer;
    address marketplace;
    uint8 marketplacePercentage;
    uint256 amount;
    uint256 validFrom; // 0 means forever, all others are a timestamp
    uint256 validUntil; // 0 means forever, all others are a timestamp
  }

  Deal[] internal _dealRegistry;
  uint256 internal _dealCount;

  function getCurrentIndex() public view onlyOwner returns (uint256) {
    return _dealCount;
  }

  mapping(uint256 => bool) internal _dealExists;
  mapping(string => Deal[]) public didToDeals;
  mapping(address => Deal[]) public userToDeals;

  struct DealAccess {
    address[] whitelist;
    address[] blacklist;
  }

  mapping(uint256 => DealAccess) internal _dealIndexToAccessList;

  event NewDeal(
    uint256 index,
    string did,
    address seller,
    address publisher,
    address buyer,
    address marketplace,
    uint256 amount,
    uint256 validFrom,
    uint256 validUntil
  );

  function createDeal(
    string memory did,
    address seller,
    uint8 sellerPercentage,
    address publisher,
    uint8 publisherPercentage,
    address buyer,
    address marketplace,
    uint8 marketplacePercentage,
    uint256 amount,
    uint256 validFrom,
    uint256 validUntil
  ) public onlyOwner whenNotPaused returns (uint256) {
    dxcTokens.escrow(
      seller,
      sellerPercentage,
      publisher,
      publisherPercentage,
      buyer,
      marketplace,
      marketplacePercentage,
      amount
    );

    Deal memory newDeal = Deal(
      did,
      _dealCount,
      seller,
      sellerPercentage,
      publisher,
      publisherPercentage,
      buyer,
      marketplace,
      marketplacePercentage,
      amount,
      validFrom,
      validUntil
    );

    _dealRegistry.push(newDeal);
    _dealExists[_dealCount] = true;
    _dealCount++;

    didToDeals[did].push(newDeal);
    userToDeals[buyer].push(newDeal);
    if (seller != buyer) {
      userToDeals[seller].push(newDeal);
    }
    if (publisher != seller && publisher != buyer) {
      userToDeals[publisher].push(newDeal);
    }
    if (
      marketplace != seller && marketplace != buyer && marketplace != publisher
    ) {
      userToDeals[marketplace].push(newDeal);
    }
    emit NewDeal(
      _dealCount,
      did,
      seller,
      publisher,
      buyer,
      marketplace,
      amount,
      validFrom,
      validUntil
    );
  }

  function allDeals()
    external
    view
    onlyOwner
    whenNotPaused
    returns (Deal[] memory)
  {
    return _dealRegistry;
  }

  function getDealByIndex(uint256 index)
    public
    view
    whenNotPaused
    returns (Deal memory)
  {
    require(_dealExists[index], "Deal does not exist");
    return _dealRegistry[index];
  }

  function dealsForDID(string calldata did)
    external
    view
    whenNotPaused
    returns (Deal[] memory)
  {
    return didToDeals[did];
  }

  function dealsForAddress(address user)
    external
    view
    whenNotPaused
    returns (Deal[] memory)
  {
    return userToDeals[user];
  }

  function hasAccessToDeal(uint256 index, address user)
    external
    view
    whenNotPaused
    returns (bool)
  {
    bool accessToDid = false;

    require(
      _dealExists[index],
      "No deal was found for the submitted user address"
    );

    Deal memory d = getDealByIndex(index);

    accessToDid = d.buyer == user;

    if (!accessToDid) {
      return accessToDid;
    }

    if (d.validFrom != 0 && d.validUntil != 0) {
      if (d.validFrom > now) {
        return false;
      }
      if (d.validUntil < now) {
        return false;
      }
    }

    DealAccess memory da = _dealIndexToAccessList[index];

    bool blackListed;
    bool whiteListed;

    if (da.whitelist.length == 0 && da.blacklist.length == 0) {
      return accessToDid;
    }

    for (uint256 i = 0; i < da.whitelist.length; i++) {
      if (!whiteListed) {
        whiteListed = da.whitelist[i] == user;
      } else {
        break;
      }
    }

    for (uint256 j = 0; j < da.blacklist.length; j++) {
      if (!blackListed) {
        blackListed = da.blacklist[j] == user;
      } else {
        break;
      }
    }

    if (!whiteListed && da.whitelist.length > 0) {
      accessToDid = false;
    }

    if (blackListed) {
      accessToDid = false;
    }

    return accessToDid;
  }

  function addPermissionsToDeal(
    address[] calldata blackList,
    address[] calldata whiteList,
    uint256 dealIndex
  ) external onlyOwner whenNotPaused {
    require(_dealExists[dealIndex], "No matching deal for index");

    DealAccess storage da = _dealIndexToAccessList[dealIndex];
    da.whitelist = whiteList;
    da.blacklist = blackList;
  }

  function payout(uint256 dealIndex) public whenNotPaused {
    Deal memory _deal = _dealRegistry[dealIndex];
    require(
      now >= _deal.validFrom + 14 days,
      "Payouts can only happen 14 days after the start of the deal (validFrom)"
    );

    // release escrow
    dxcTokens.releaseEscrow(
      _deal.buyer,
      _deal.seller,
      _deal.publisher,
      _deal.marketplace,
      _deal.amount,
      _deal.sellerPercentage,
      _deal.publisherPercentage,
      _deal.marketplacePercentage
    );

    // transfer DTX
    dxcTokens.transferEx(
      _deal.buyer,
      _deal.seller,
      _deal.amount.mul(_deal.sellerPercentage).div(100)
    );
    dxcTokens.transferEx(
      _deal.buyer,
      _deal.publisher,
      _deal.amount.mul(_deal.publisherPercentage).div(100)
    );
    dxcTokens.transferEx(
      _deal.buyer,
      _deal.marketplace,
      _deal.amount.mul(_deal.marketplacePercentage).div(100)
    );
    uint256 protocolAmount = _deal.amount.sub(
      (_deal.amount.mul(_deal.sellerPercentage).div(100))
        .add(_deal.amount.mul(_deal.publisherPercentage).div(100))
        .add(_deal.amount.mul(_deal.marketplacePercentage).div(100))
    );
    dxcTokens.transferEx(_deal.buyer, address(this), protocolAmount);
  }
}
