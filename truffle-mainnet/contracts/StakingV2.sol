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
  uint256 private lastPayoutTimestamp;
  uint256 private totalStakes;

  mapping(address => Stake) private stakeholderToStake;
  mapping(address => uint256) private claimRewards;
  mapping(uint256 => mapping(address => uint256)) private payoutCredits;

  event StakeTransactions(
    address indexed stakeholder,
    uint256 amount,
    uint8 txType,
    uint256 txTimestamp
  );
  event Rewards(address indexed stakeholder, uint256 amount, uint256 timestamp);

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

  function getLockedStakeDetails(address stakeholder)
    public
    view
    onlyOwner
    returns (uint256, uint256)
  {
    return (
      stakeholderToStake[stakeholder].lockedDTX,
      stakeholderToStake[stakeholder].startTimestamp
    );
  }

  function getPayoutCredits(uint256 payoutCycle, address stakeholder)
    public
    view
    onlyOwner
    returns (uint256)
  {
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

    if (lastPayoutTimestamp > stakeholderToStake[stakeholder].startTimestamp) {
      stakeStartTime = lastPayoutTimestamp;
    } else {
      stakeStartTime = stakeholderToStake[stakeholder].startTimestamp;
    }

    if (_isStakeholder) {
      // update the payout credit for existing stake and stake duration
      payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[
        payoutCounter.current()
      ][stakeholder]
      .add(
        (stakeholderToStake[stakeholder].lockedDTX).mul(
          (currTimestamp).sub(stakeStartTime)
        )
      );

      // update the stake
      stakeholderToStake[stakeholder].lockedDTX = (
        stakeholderToStake[stakeholder].lockedDTX
      )
      .add(stake);
      stakeholderToStake[stakeholder].startTimestamp = currTimestamp;
    } else {
      addStakeholder(stakeholder);

      stakeholderToStake[stakeholder] = Stake({
        lockedDTX: stake,
        startTimestamp: currTimestamp
      });
    }

    emit StakeTransactions(stakeholder, stake, 0, currTimestamp);
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

    if (lastPayoutTimestamp > stakeholderToStake[msg.sender].startTimestamp) {
      stakeStartTime = lastPayoutTimestamp;
    } else {
      stakeStartTime = stakeholderToStake[msg.sender].startTimestamp;
    }

    // update the payout credit for existing stake and stake duration
    payoutCredits[payoutCounter.current()][msg.sender] = payoutCredits[
      payoutCounter.current()
    ][msg.sender]
    .add(
      (stakeholderToStake[msg.sender].lockedDTX).mul(
        (currTimestamp).sub(stakeStartTime)
      )
    );
    // update the stake
    stakeholderToStake[msg.sender].lockedDTX = (
      stakeholderToStake[msg.sender].lockedDTX
    )
    .sub(stake);
    stakeholderToStake[msg.sender].startTimestamp = currTimestamp;

    totalStakes -= stake; // TODO: Why .sub is not updating the totalStakes
    _mint(address(this), stake);

    emit StakeTransactions(msg.sender, stake, 1, currTimestamp);
  }

  function stakeOf(address stakeholder) public view returns (uint256) {
    return stakeholderToStake[stakeholder].lockedDTX;
  }

  function getTotalStakes() public view returns (uint256) {
    return totalStakes;
  }

  function totalCredits(uint256 payoutCycle)
    public
    view
    onlyOwner
    returns (uint256)
  {
    uint256 totalCredits = 0;

    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      totalCredits = totalCredits.add(
        payoutCredits[payoutCycle][stakeholders[s]]
      );
    }

    return totalCredits;
  }

  function rewardOf(address stakeholder) public view returns (uint256) {
    return claimRewards[stakeholder];
  }

  function totalRewards() public view returns (uint256) {
    uint256 totalRewards = 0;
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      totalRewards = totalRewards.add(claimRewards[stakeholders[s]]);
    }
    return totalRewards;
  }

  function monthlyReward() public view returns (uint256) {
    uint256 _totalRewards = totalRewards();
    require(
      dtxToken.balanceOf(address(this)) >= totalStakes.add(_totalRewards),
      "Rewards are not available yet"
    );

    uint256 monthReward = dtxToken
    .balanceOf(address(this))
    .sub(totalStakes)
    .sub(_totalRewards);

    return monthReward;
  }

  function calculatePayoutCredit(address stakeholder, uint256 currTimestamp)
    internal
    returns (address)
  {
    uint256 stakeStartTime;

    if (
      payoutCredits[payoutCounter.current()][stakeholder] == 0 &&
      stakeholderToStake[stakeholder].lockedDTX == 0
    ) {
      return stakeholder;
    }

    if (lastPayoutTimestamp > stakeholderToStake[stakeholder].startTimestamp) {
      stakeStartTime = lastPayoutTimestamp;
    } else {
      stakeStartTime = stakeholderToStake[stakeholder].startTimestamp;
    }

    payoutCredits[payoutCounter.current()][stakeholder] = payoutCredits[
      payoutCounter.current()
    ][stakeholder]
    .add(
      (stakeholderToStake[stakeholder].lockedDTX).mul(
        (currTimestamp).sub(stakeStartTime)
      )
    );

    return address(0);
  }

  function calculateReward(
    address stakeholder,
    uint256 monthlyReward,
    uint256 totalCredits
  ) internal returns (uint256) {
    uint256 stakeholderRatio = (
      payoutCredits[payoutCounter.current()][stakeholder]
    )
    .mul(1000000000000000000)
    .div(totalCredits);

    return (monthlyReward.mul(stakeholderRatio)).div(1000000000000000000);
  }

  function distributeRewards() public onlyOwner {
    uint256 monthlyReward = monthlyReward();
    uint256 currTimestamp = block.timestamp;
    address[] memory stakeholdersToRemove = new address[](stakeholders.length);
    uint256 stakeholdersToRemoveIndex = 0;

    require(monthlyReward > 0, "Not enough rewards to distribute");

    // update payout credits
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      address staker = calculatePayoutCredit(stakeholder, currTimestamp);

      if (stakeholder != address(0)) {
        stakeholdersToRemove[stakeholdersToRemoveIndex] = staker;
        stakeholdersToRemoveIndex += 1;
      }
    }

    // Remove non-stakeholders
    for (uint256 s = 0; s < stakeholdersToRemove.length; s += 1) {
      removeStakeholder(stakeholdersToRemove[s]);
    }

    uint256 totalCredits = totalCredits(payoutCounter.current());
    require(totalCredits > 0, "Total credits is 0");

    // Calculate rewards
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      uint256 rewards = calculateReward(
        stakeholder,
        monthlyReward,
        totalCredits
      );
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

      emit Rewards(stakeholder, reward, block.timestamp);
    }
  }

  function withdrawReward() public {
    uint256 reward = claimRewards[msg.sender];
    require(reward > 0, "No reward to withdraw");
    claimRewards[msg.sender] = 0;
    bool transferResult = dtxToken.transfer(msg.sender, reward);

    require(transferResult, "DTX transfer failed");

    _mint(address(this), reward);

    emit Rewards(msg.sender, reward, block.timestamp);
  }

  function getTotalStakeholders() public view onlyOwner returns (uint256) {
    return stakeholders.length;
  }
}
