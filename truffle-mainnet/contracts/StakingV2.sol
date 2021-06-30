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

contract Staking is ERC20, Ownable {
  using SafeMath for uint256;
  using Counters for Counters.Counter;

  IERC20 dtxToken;
  Counters.Counter private payoutCounter;

  struct Stake {
    uint256 lockedDTX;
    uint256 startTimestamp;
    // uint256 payoutTimestamp;
  }

  address[] private stakeholders;
  uint256 private lastPayoutTimestamp;
  uint256 private totalStakes;

  mapping(address => Stake) private stakeholderToStake;
  mapping(address => uint256) private claimRewards;
  mapping(uint256 => mapping(address => uint256)) private payoutCredits;

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
    totalStakes = 0;
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

  function createStake(address stakeholder, uint256 stake) public {
    bool transferResult = dtxToken.transferFrom(
      stakeholder,
      address(this),
      stake
    );

    require(transferResult, "DTX transfer failed");

    _burn(address(this), stake);

    (bool _isStakeholder, ) = isStakeholder(stakeholder);
    uint256 currTimestamp = block.timestamp;

    if(_isStakeholder) {
      // update the payout credit for existing stake and stake duration
      payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[payoutCounter.current()][stakeholder].add(
        (stakeholderToStake[stakeholder].lockedDTX).mul((currTimestamp).sub(stakeholderToStake[stakeholder].startTimestamp))
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

    totalStakes.add(stake);
  }

  function removeStake(uint256 stake) public {
    require(
      stakeholderToStake[msg.sender].lockedDTX >= stake,
      "Not enough staked!"
    );

    bool transferResult = dtxToken.transfer(msg.sender, stake);
    require(transferResult, "DTX transfer failed");

    uint256 currTimestamp = block.timestamp;

    // update the payout credit for existing stake and stake duration
    payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[payoutCounter.current()][stakeholder].add(
      (stakeholderToStake[stakeholder].lockedDTX).mul((currTimestamp).sub(stakeholderToStake[stakeholder].startTimestamp))
    );
    // update the stake
    stakeholderToStake[stakeholder].lockedDTX = (stakeholderToStake[stakeholder].lockedDTX).sub(stake);

    if(stakeholderToStake[stakeholder].lockedDTX == 0) {
      removeStakeholder(msg.sender);
    }
    totalStakes.sub(stake);
    _mint(address(this), _stake);
  }

  function totalRewards() public view returns (uint256) {
    uint256 totalRewards = 0;
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      totalRewards = totalRewards.add(payoutCredits[payoutCounter.current()][stakeholders[s]]);
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

  /*
  function calculateReward(address stakeholder, uint256 monthlyReward) internal returns(uint256) {
    // uint256 existingStake = stakeholderToStake[stakeholder].lockedDTX;
    uint256 currTimestamp = block.timestamp;

    // update the payout credit for existing stake and stake duration
    payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[payoutCounter.current()][stakeholder].add(
      (stakeholderToStake[stakeholder].lockedDTX).mul((currTimestamp).sub(stakeholderToStake[stakeholder].startTimestamp))
    );
    // update the stake
    stakeholderToStake[stakeholder].lockedDTX = 0;

    uint256 stakeholderRatio = (payoutCredits[payoutCounter.current()][stakeholder]).mul(1000).div(totalRewards());
    return monthlyReward().mul(stakeholderRatio).div(1000);
  }

  function distributeRewards(uint256 currentTime, uint256 totalTime) public onlyOwner {
    uint256 monthlyReward = monthlyReward();

    require(monthlyReward > 0, "Not enough rewards to distribute");

    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      uint256 rewards = calculateReward(stakeholder, monthlyReward);
      claimRewards[stakeholder] = claimRewards[stakeholder].add(rewards);
    }

    // Increase payoutCounter
    payoutCounter.increment();
  }
  */
}

