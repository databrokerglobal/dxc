// SPDX-License-Identifier: UNLICENSED
/**
 * Copyright (C) SettleMint NV - All Rights Reserved
 *
 * Use of this file is strictly prohibited without an active license agreement.
 * Distribution of this file, via any medium, is strictly prohibited.
 *
 * For license inquiries, contact hello@settlemint.com
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract StakingV2 is ERC20, Ownable {
  using SafeMath for uint256;
  using Counters for Counters.Counter;

  IERC20 dtxToken;
  Counters.Counter private payoutCounter;

  struct Stake {
    uint256 lockedDTX;
    uint256 startTimestamp;
  }

  address[] private stakeholders;
  uint256 public lastPayoutTimestamp; // TODO: Make private
  uint256 public totalStakes; // TODO: Make private

  mapping(address => Stake) private stakeholderToStake;  // TODO: Make private
  mapping(address => uint256) private claimRewards;  // TODO: Make private
  mapping(uint256 => mapping(address => uint256)) private payoutCredits;  // TODO: Make private

  event CreateStake(address indexed stakeholder, uint256 amount);
  event RemoveStake(address indexed stakeholder, uint256 amount);


  /**
   * @notice The constructor for the Staking Token.
   * @param _owner The address to receive all tokens on construction.
   * @param _supply The amount of tokens to mint on construction.
   * @param _dtxToken address of the already deployed contract
   */
  constructor(
    address _owner,
    uint256 _supply,
    address _dtxToken
  ) payable ERC20("DTXStaking", "DTXS") {
    _mint(address(this), _supply);
    dtxToken = IERC20(_dtxToken);
    // totalStakes = 0;
    // lastPayoutTimestamp = 0;
  }

  function isStakeholder(address stakeholder)
    public
    view
    returns (bool, uint256)
  {
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      if (stakeholder == stakeholders[s]) return (true, s);
    }
    return (false, 0);
  }

  function addStakeholder(address stakeholder) internal {
    (bool _isStakeholder, ) = isStakeholder(stakeholder);

    if (!_isStakeholder) stakeholders.push(stakeholder);
  }

  function removeStakeholder(address _stakeholder) internal {
    (bool _isStakeholder, uint256 s) = isStakeholder(_stakeholder);
    if (_isStakeholder) {
      stakeholders[s] = stakeholders[stakeholders.length - 1];
      stakeholders.pop();
    }
  }

  function getLockedStakeDetails(address stakeholder) public view onlyOwner returns(uint256, uint256){
    return (stakeholderToStake[stakeholder].lockedDTX, stakeholderToStake[stakeholder].startTimestamp);
  }

  function getPayoutCredits(uint256 payoutCycle, address stakeholder) public view onlyOwner returns(uint256) {
    return payoutCredits[payoutCycle][stakeholder];
  }

  function createStake(address stakeholder, uint256 stake) public {
    bool transferResult = dtxToken.transferFrom(
      stakeholder,
      address(this),
      stake
    );

    require(transferResult, "DTX transfer failed");

    _burn(address(this), stake);
    totalStakes += stake;

    (bool _isStakeholder, ) = isStakeholder(stakeholder);
    uint256 currTimestamp = block.timestamp;
    uint256 stakeStartTime;

    if(lastPayoutTimestamp > stakeholderToStake[stakeholder].startTimestamp) {
      stakeStartTime = lastPayoutTimestamp;
    } else {
      stakeStartTime = stakeholderToStake[stakeholder].startTimestamp;
    }

    if(_isStakeholder) {
      // update the payout credit for existing stake and stake duration
      payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[payoutCounter.current()][stakeholder].add(
        (stakeholderToStake[stakeholder].lockedDTX).mul((currTimestamp).sub(stakeStartTime))
      );

      // update the stake
      stakeholderToStake[stakeholder].lockedDTX = (stakeholderToStake[stakeholder].lockedDTX).add(stake);
      stakeholderToStake[stakeholder].startTimestamp = currTimestamp;
    } else {
      addStakeholder(stakeholder);

      stakeholderToStake[stakeholder] = Stake({
        lockedDTX: stake,
        startTimestamp: block.timestamp
      });
    }

    emit CreateStake(stakeholder, stake);
  }

  function removeStake(uint256 stake) public {
    require(
      stakeholderToStake[msg.sender].lockedDTX >= stake,
      "Not enough staked!"
    );

    bool transferResult = dtxToken.transfer(msg.sender, stake);
    require(transferResult, "DTX transfer failed");

    uint256 currTimestamp = block.timestamp;
    uint256 stakeStartTime;

    if(lastPayoutTimestamp > stakeholderToStake[msg.sender].startTimestamp) {
      stakeStartTime = lastPayoutTimestamp;
    } else {
      stakeStartTime = stakeholderToStake[msg.sender].startTimestamp;
    }

    // update the payout credit for existing stake and stake duration
    payoutCredits[payoutCounter.current()][msg.sender] = payoutCredits[payoutCounter.current()][msg.sender].add(
      (stakeholderToStake[msg.sender].lockedDTX).mul((currTimestamp).sub(stakeStartTime))
    );
    // update the stake
    stakeholderToStake[msg.sender].lockedDTX = (stakeholderToStake[msg.sender].lockedDTX).sub(stake);
    stakeholderToStake[msg.sender].startTimestamp = currTimestamp;

    totalStakes -= stake; // TODO: Why .sub is not updating the totalStakes in Remix
    _mint(address(this), stake);

    emit RemoveStake(msg.sender, stake);
  }

  function stakeOf(address stakeholder) public view returns (uint256) {
    return stakeholderToStake[stakeholder].lockedDTX;
  }

  function getTotalStakes() public view returns (uint256) {
    return totalStakes;
  }

  function totalCredits(uint256 payoutCycle) public view onlyOwner returns (uint256) {
    uint256 totalCredits = 0;
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      totalCredits = totalCredits.add(payoutCredits[payoutCycle][stakeholders[s]]);
    }
    return totalCredits;
  }

  function rewardOf(address stakeholder) public view returns (uint256) {
    return claimRewards[stakeholder];
  }

  function totalRewards() public view returns (uint256) {
    uint256 totalRewards = 0;
    for(uint256 s = 0; s < stakeholders.length; s += 1) {
      totalRewards = totalRewards.add(claimRewards[stakeholders[s]]);
    }
    return totalRewards;
  }

  function monthlyReward() public view returns (uint256) {
    uint256 _totalRewards = totalRewards();
    require(dtxToken.balanceOf(address(this)) >= totalStakes.add(_totalRewards), "Rewards are not available yet");

    uint256 monthReward =
      dtxToken.balanceOf(address(this)).sub(totalStakes).sub(_totalRewards);

    return monthReward;
  }

  function calculatePayoutCredit(address stakeholder) internal returns(bool) {
    uint256 currTimestamp = block.timestamp;
    uint256 stakeStartTime;

    if(payoutCredits[payoutCounter.current()][stakeholder] == 0 && stakeholderToStake[stakeholder].lockedDTX == 0) {
      removeStakeholder(stakeholder);
      return true;
    }

    if(lastPayoutTimestamp > stakeholderToStake[stakeholder].startTimestamp) {
      stakeStartTime = lastPayoutTimestamp;
    } else {
      stakeStartTime = stakeholderToStake[stakeholder].startTimestamp;
    }

    payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[payoutCounter.current()][stakeholder].add(
      (stakeholderToStake[stakeholder].lockedDTX).mul((currTimestamp).sub(stakeStartTime))
    );

    return true;
  }

  function calculateReward(address stakeholder, uint256 monthlyReward, uint256 totalCredits) internal returns(uint256) {
    uint256 stakeholderRatio = (payoutCredits[payoutCounter.current()][stakeholder]).mul(1000).div(totalCredits);

    return (monthlyReward.mul(stakeholderRatio)).div(1000);
  }

  function distributeRewards() public onlyOwner {
    uint256 monthlyReward = monthlyReward();
    uint256 totalCredits = totalCredits(payoutCounter.current());

    require(monthlyReward > 0, "Not enough rewards to distribute");
    require(totalCredits > 0, "Total credits is 0");

    // update payout credits
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      calculatePayoutCredit(stakeholder);
    }

    // Calculate rewards
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      uint256 rewards = calculateReward(stakeholder, monthlyReward, totalCredits);
      claimRewards[stakeholder] = claimRewards[stakeholder].add(rewards);
    }

    payoutCounter.increment();
    lastPayoutTimestamp = block.timestamp;
  }

  function withdrawAllReward() public onlyOwner {
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      uint256 reward = claimRewards[stakeholder];
      bool transferResult = dtxToken.transfer(stakeholder, reward);

      require(transferResult, "DTX transfer failed");

      claimRewards[stakeholder] = 0;
      _mint(address(this), reward);
    }
  }

  function withdrawReward() public {
    uint256 reward = claimRewards[msg.sender];
    require(reward > 0, "No reward to withdraw");
    claimRewards[msg.sender] = 0;
    bool transferResult = dtxToken.transfer(msg.sender, reward);

    require(transferResult, "DTX transfer failed");

    _mint(address(this), reward);
  }
}

/*
    A1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4
    A2 = 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2
    A3 = 0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c

    18 0's - 000000000000000000

    "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4","1000000000000000000000000000000000000","0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8"

    ##### Scenario 1 #####
    450000 + 550000 =  1000000
    920000 + 1079000 = 1999000
    470000 + 529000
*/

