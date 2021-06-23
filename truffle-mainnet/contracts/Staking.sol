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

contract Staking is ERC20, Ownable {
  using SafeMath for uint256;
  IERC20 dtxToken;

  address[] public stakeholders;
  uint256 internal totalStakes;
  mapping(address => uint256) internal rewards;
  mapping(address => uint256) private stakes; // address => staked amount
  mapping(address => uint256) private time; // address to staked time in unix timestamp

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

  /**
   * @notice A method to check if an address is a stakeholder.
   * @param _address The address to verify.
   * @return bool, uint256 Whether the address is a stakeholder,
   * and if so its position in the stakeholders array.
   */
  function isStakeholder(address _address) public view returns (bool, uint256) {
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      if (_address == stakeholders[s]) return (true, s);
    }
    return (false, 0);
  }

  /**
   * @notice A method to add a stakeholder.
   * @param _stakeholder The stakeholder to add.
   * MUST revet if stakeholder already exists
   */
  function addStakeholder(address _stakeholder) internal {
    (bool _isStakeholder, ) = isStakeholder(_stakeholder);

    if (!_isStakeholder) stakeholders.push(_stakeholder);
  }

  /**
   * @notice A method to remove a stakeholder.
   * @param _stakeholder The stakeholder to remove.
   * MUST revert if stakeholder already removed
   */
  function removeStakeholder(address _stakeholder) internal {
    (bool _isStakeholder, uint256 s) = isStakeholder(_stakeholder);
    if (_isStakeholder) {
      stakeholders[s] = stakeholders[stakeholders.length - 1];
      stakeholders.pop();
    }
  }

  /**
   * @notice a method to retrieve the stake for a stakeholder.
   * @param _stakeholder The stakeholder to retrieve the stake for.
   * @return uint256 The amount of wei staked.
   */
  function stakeOf(address _stakeholder) public view returns (uint256) {
    return stakes[_stakeholder];
  }

  function getTotalStakes() public view returns (uint256) {
      return totalStakes;
  }

  function totalTime(uint256 currentTimestamp) public view returns(uint256) {
      uint256 _totalTime = 0;
      for(uint256 s = 0; s < stakeholders.length; s += 1) {
          _totalTime = _totalTime.add(currentTimestamp.sub(time[stakeholders[s]]));
      }
      return _totalTime;
  }

  function getTime(address stakeholder) public view returns(uint256) {
    return time[stakeholder];
  } 

  /**
   * @notice A method for a stakeholder to create a stake.
   * @param _stake The size of the stake to be created.
   *
   * MUST revert if not enough token to stake
   */
  function createStake(address stakeholder, uint256 _stake) public {

    // DTX staking
    bool transferResult = dtxToken.transferFrom(stakeholder, address(this), _stake);

    require(transferResult, "DTX transfer failed");

    //DTXS
    _burn(address(this), _stake);
    if (stakes[stakeholder] == 0) {
      addStakeholder(stakeholder);
    }

    stakes[stakeholder] = stakes[stakeholder].add(_stake);
    totalStakes = totalStakes.add(_stake);

    if (time[stakeholder] == 0) {
      time[stakeholder] = time[stakeholder].add(block.timestamp);
    } else {
      time[stakeholder] = (time[stakeholder] + block.timestamp).div(2);
    }
  }

  /**
   * @notice A method for a stakeholder to remove a stake.
   * @param _stake The size of the stake to be removed.
   * MUST revert if stakeholder did not stake enough
   */
  function removeStake(uint256 _stake) public {

    // DTX staking
    require(stakes[msg.sender] >= _stake, "Not enough staked!");
    bool transferResult = dtxToken.transfer(msg.sender, _stake);
    require(transferResult, "DTX transfer failed");

    stakes[msg.sender] = stakes[msg.sender].sub(_stake);
    totalStakes = totalStakes.sub(_stake);

    if (stakes[msg.sender] == 0) {
      removeStakeholder(msg.sender);
      time[msg.sender] = 0;
    }
    // TOCONFIRM: Do we need to reduce the duration of stake as well?
    else {
      time[msg.sender] = (time[msg.sender] +  block.timestamp).div(2);
    }

    _mint(address(this), _stake);

  }

  /**
   * @notice A method to allow a stakeholder to check his rewards.
   * @param _stakeholder the stakeholder to check rewards for.
   */
  function rewardOf(address _stakeholder) public view returns (uint256) {
    return rewards[_stakeholder];
  }

  /**
   * @notice A method to the aggregated rewards from all stakeholders.
   * @return uint256 The aggregated rewards from all stakeholders.
   */
  function totalRewards() public view returns (uint256) {
    uint256 _totalRewards = 0;
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      _totalRewards = _totalRewards.add(rewards[stakeholders[s]]);
    }
    return _totalRewards;
  }

  /**
   * @notice method that will return how much staking is available for this month.
   * The financia idea: during a month, when a deal is done a percentage of deal's value will be send to this contract
   * At the end of the month the total rewards will be send to the stakeholders, based on their share of the total stakes token
   * And the time they stake over a period of 30 days
   */

  function monthlyReward() public view returns (uint256) {
    require(dtxToken.balanceOf(address(this)) >= totalStakes.add(totalRewards()), "Rewards are not available yet");

    uint256 monthReward =
      dtxToken.balanceOf(address(this)).sub(totalStakes).sub(totalRewards());
    return monthReward;
  }

  /**
   * @notice A simple method that calculates the rewards for each stakeholder. This method will be called at the
   * end of each month. Each stakeholder will receive stakes based on his/her proportion compared to the total staked amount
   * But also based on the length that a trader kept his token in the staking program over that month.
   * @param _stakeholder The stakeholder to calculate rewards for.
   */
  function calculateReward(address _stakeholder, uint256 totalReward, uint256 currentTime, uint256 totalTimeStakeholder)
    internal
    view
    returns (uint256)
  {
    uint256 stakeRatio = stakeOf(_stakeholder).mul(100).div(totalStakes);
    uint256 durationRatio = currentTime.sub(time[_stakeholder]).mul(100).div(totalTimeStakeholder);
    uint256 stakeShare = totalReward.mul(stakeRatio);
    uint256 durationShare = totalReward.mul(durationRatio);

    uint256 reward = ((stakeShare + durationShare).div(2)).div(100);

    return reward;
  }

  /**
   * @notice A method to distribute rewards to all stakeholders. Should be called at the end of the month.
   */
  function distributeRewards(uint256 currentTime, uint256 totalTime) public onlyOwner {
    uint256 monthlyReward = monthlyReward();

    require(monthlyReward > 0, "Not enough rewards to distribute");

    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      uint256 reward = calculateReward(stakeholder, monthlyReward, currentTime, totalTime);
      rewards[stakeholder] = rewards[stakeholder].add(reward);
    }
  }

  /**
   * @notice A method that will allow owner to transfer all the rewards
   * @dev can only be called by contract owner
   * @dev staking contract needs approval from DTX contract for total rewards
   */
  function withdrawAllReward() public onlyOwner {
    for (uint256 s = 0; s < stakeholders.length; s += 1) {
      address stakeholder = stakeholders[s];
      uint256 reward = rewards[stakeholder];
      bool transferResult = dtxToken.transfer(stakeholder, reward);

      require(transferResult, "DTX transfer failed");

      rewards[stakeholder] = 0;
      _mint(address(this), reward);
    }
  }

  /**
   * @notice Method to allow a stakeholder to withdraw a reward.
   * MUST stakeholder has a reward value
   */
  function withdrawReward() public {
    uint256 reward = rewards[msg.sender];
    require(reward > 0, "No reward to withdraw");
    rewards[msg.sender] = 0;
    bool transferResult = dtxToken.transfer(msg.sender, reward);

    require(transferResult, "DTX transfer failed");

    _mint(address(this), reward);
  }
}
