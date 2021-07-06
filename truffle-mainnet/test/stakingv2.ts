const { accounts, contract } = require('@openzeppelin/test-environment');
const StakingV2 = contract.fromArtifact('StakingV2');
const DTX = contract.fromArtifact('DTX');

import { utils } from 'ethers';
// @ts-ignore
import { time } from '@openzeppelin/test-helpers';

describe('Staking V2', async () => {
  let stakingInstance: any;
  let dtxInstance: any;

  async function getExpectedReward(
    staker: string,
    owner: string,
    existingPayoutCredits: string,
    payoutDay: string,
    payoutCycle: number,
    rewardForMonth: string
  ) {
    const lockedDTX = (
      await stakingInstance.getLockedStakeDetails(staker, { from: owner })
    )[0].toString();

    const stakeStartTimestamp = (
      await stakingInstance.getLockedStakeDetails(staker, { from: owner })
    )[1].toString();

    const expectedPayoutCredits =
      parseInt(existingPayoutCredits) +
      (parseInt(payoutDay) - parseInt(stakeStartTimestamp)) *
        parseInt(lockedDTX);

    const totalPayoutCredits = (
      await stakingInstance.totalCredits(payoutCycle, { from: owner })
    ).toString();

    const stakeholderRatio = Math.trunc(
      (expectedPayoutCredits * 1000000000000000000) /
        parseInt(totalPayoutCredits)
    );

    return (parseInt(rewardForMonth) * stakeholderRatio) / 1000000000000000000;
  }

  beforeEach(async () => {
    const [owner, staker1, staker2, staker3, staker4, staker5] = accounts;
    dtxInstance = await DTX.new(utils.parseUnits('999999'), {
      from: owner,
    });

    stakingInstance = await StakingV2.new(
      owner,
      web3.utils.toWei('999999'),
      dtxInstance.address,
      { from: owner }
    );

    await dtxInstance.transfer(staker1, web3.utils.toWei('1000'), {
      from: owner,
    });
    await dtxInstance.transfer(staker2, web3.utils.toWei('1000'), {
      from: owner,
    });
    await dtxInstance.transfer(staker3, web3.utils.toWei('1000'), {
      from: owner,
    });
    await dtxInstance.transfer(staker4, web3.utils.toWei('1000'), {
      from: owner,
    });
    await dtxInstance.transfer(staker5, web3.utils.toWei('1000'), {
      from: owner,
    });
  });

  it('stakeholder should be able to create a stake for first time', async () => {
    // approve staker's DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('100'),
      { from: accounts[0] }
    );

    await stakingInstance.createStake(accounts[0], web3.utils.toWei('100'));

    expect((await stakingInstance.stakeOf(accounts[0])).toString()).to.be.equal(
      web3.utils.toWei('100')
    );
    expect((await stakingInstance.getTotalStakes()).toString()).to.be.equal(
      web3.utils.toWei('100')
    );
  });

  it('stakeholder should be able to create additional stake for first time', async () => {
    // approve staker's DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('600'),
      { from: accounts[0] }
    );

    // create 1st stake and assert
    await stakingInstance.createStake(accounts[0], web3.utils.toWei('100'));
    const firstStakeTimestamp = (await time.latest()).toString();
    const lockedDTX = (
      await stakingInstance.getLockedStakeDetails(accounts[0], {
        from: accounts[0],
      })
    )[0].toString();
    const startTimestamp = (
      await stakingInstance.getLockedStakeDetails(accounts[0], {
        from: accounts[0],
      })
    )[1].toString();

    expect(lockedDTX).to.be.equal(web3.utils.toWei('100'));
    expect(startTimestamp).to.be.equal(firstStakeTimestamp);

    // Time travel 15 days ahead
    await time.increase(time.duration.days(15));
    const secondStakeTimestamp = (await time.latest()).toString();

    // create 2nd stake and assert
    await stakingInstance.createStake(accounts[0], web3.utils.toWei('500'));
    const newLockedDTX = (
      await stakingInstance.getLockedStakeDetails(accounts[0], {
        from: accounts[0],
      })
    )[0].toString();
    const newStartTimestamp = (
      await stakingInstance.getLockedStakeDetails(accounts[0], {
        from: accounts[0],
      })
    )[1].toString();

    expect(newLockedDTX).to.be.equal(web3.utils.toWei('600'));
    expect(newStartTimestamp).to.be.equal(secondStakeTimestamp);

    // Assert updated payout credit
    const payoutCredits = (
      await stakingInstance.getPayoutCredits(0, accounts[0], {
        from: accounts[0],
      })
    ).toString();
    const expectedPayoutCredits =
      (secondStakeTimestamp - firstStakeTimestamp) * web3.utils.toWei('100');

    expect(parseInt(payoutCredits)).to.be.equal(expectedPayoutCredits);
  });

  it('stakeholder should be able to remove stake', async () => {
    // approve staker's DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: accounts[0] }
    );

    // Create stake of 1000 DTX
    await stakingInstance.createStake(accounts[0], web3.utils.toWei('1000'));
    const firstStakeTimestamp = (await time.latest()).toString();

    // Time travel 15 days ahead
    await time.increase(time.duration.days(15));
    const secondStakeTimestamp = (await time.latest()).toString();

    // Remove stake of 500 DTX
    await stakingInstance.removeStake(web3.utils.toWei('500'), {
      from: accounts[0],
    });
    const newLockedDTX = (
      await stakingInstance.getLockedStakeDetails(accounts[0], {
        from: accounts[0],
      })
    )[0].toString();
    const newStartTimestamp = (
      await stakingInstance.getLockedStakeDetails(accounts[0], {
        from: accounts[0],
      })
    )[1].toString();

    expect(newLockedDTX).to.be.equal(web3.utils.toWei('500'));
    expect(newStartTimestamp).to.be.equal(secondStakeTimestamp);

    // Assert updated payout credit
    const payoutCredits = (
      await stakingInstance.getPayoutCredits(0, accounts[0], {
        from: accounts[0],
      })
    ).toString();
    const expectedPayoutCredits =
      (secondStakeTimestamp - firstStakeTimestamp) * web3.utils.toWei('1000');

    expect(parseInt(payoutCredits)).to.be.equal(expectedPayoutCredits);
  });

  it('distribute rewards', async () => {
    const [owner, staker1, staker2, staker3, staker4, staker5] = accounts;
    let payoutCycle = 0;

    // First day of the month #################################

    // Staker4 stakes 1000 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker4 }
    );
    await stakingInstance.createStake(staker4, web3.utils.toWei('1000'), {
      from: staker4,
    });
    const firstDayOfMonth = (await time.latest()).toString();

    // Time travel 30 days ahead
    await time.increase(time.duration.days(30));
    const lastDayOfFirstMonth = (await time.latest()).toString();

    // Add platform commission
    await dtxInstance.transfer(
      stakingInstance.address,
      web3.utils.toWei('5000'),
      { from: owner }
    );

    // distribute rewards and assert
    await stakingInstance.distributeRewards({ from: owner });

    const payoutCredits = (
      await stakingInstance.getPayoutCredits(payoutCycle, staker4, {
        from: owner,
      })
    ).toString();
    const expectedPayoutCredits =
      (lastDayOfFirstMonth - firstDayOfMonth) * web3.utils.toWei('1000');

    expect(parseInt(payoutCredits)).to.be.equal(expectedPayoutCredits);
    expect((await stakingInstance.rewardOf(staker4)).toString()).to.be.equal(
      web3.utils.toWei('5000')
    );

    payoutCycle++;

    // Time travel 1 day ahead
    await time.increase(time.duration.days(1));

    /* First Day of next month #################################
     * Staker1, Staker2, Staker3 and Staker5 staked 1000 DTX each
     * All are first time staker
     */

    // staker1
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker1 }
    );
    await stakingInstance.createStake(staker1, web3.utils.toWei('1000'), {
      from: staker1,
    });

    // staker2
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker2 }
    );
    await stakingInstance.createStake(staker2, web3.utils.toWei('1000'), {
      from: staker2,
    });

    // Staker3
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker3 }
    );
    await stakingInstance.createStake(staker3, web3.utils.toWei('1000'), {
      from: staker3,
    });

    // Staker5
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker5 }
    );
    await stakingInstance.createStake(staker5, web3.utils.toWei('1000'), {
      from: staker5,
    });

    // Time travel 15 day ahead
    await time.increase(time.duration.days(15));

    /*  Mid of next month #################################
     * Staker1 and Staker4 removes their 1000 DTX each
     * Staker5 adds 1000 DTX to its stake
     */

    // Staker1 removes 1000 DTX
    await stakingInstance.removeStake(web3.utils.toWei('1000'), {
      from: staker1,
    });

    // Staker4 removes 1000 DTX
    await stakingInstance.removeStake(web3.utils.toWei('1000'), {
      from: staker4,
    });

    // Staker5 adds 1000 more DTX
    await dtxInstance.transfer(staker5, web3.utils.toWei('1000'), {
      from: owner,
    });
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker5 }
    );
    await stakingInstance.createStake(staker5, web3.utils.toWei('1000'), {
      from: staker5,
    });

    // Time travel 15 day ahead to 30th of the month
    await time.increase(time.duration.days(15));

    /*
     * 30th on next Month #################################
     * Staker2 and staker5 removes 1000DTX each
     */

    // Staker2 removes 1000 DTX
    await stakingInstance.removeStake(web3.utils.toWei('1000'), {
      from: staker2,
    });

    // Staker5 removes 1000 DTX
    await stakingInstance.removeStake(web3.utils.toWei('1000'), {
      from: staker5,
    });

    // Time travel 1 day ahead to 31st of the month
    await time.increase(time.duration.days(1));
    const payoutDay = (await time.latest()).toString();

    /*
     * 31st on next Month #################################
     * Payout day
     */

    // Add platform commission
    await dtxInstance.transfer(
      stakingInstance.address,
      web3.utils.toWei('10000'),
      { from: owner }
    );

    const payoutCreditsStaker1 = (
      await stakingInstance.getPayoutCredits(payoutCycle, staker1, {
        from: owner,
      })
    ).toString();
    const payoutCreditsStaker2 = (
      await stakingInstance.getPayoutCredits(payoutCycle, staker2, {
        from: owner,
      })
    ).toString();
    const payoutCreditsStaker3 = (
      await stakingInstance.getPayoutCredits(payoutCycle, staker3, {
        from: owner,
      })
    ).toString();
    const payoutCreditsStaker4 = (
      await stakingInstance.getPayoutCredits(payoutCycle, staker4, {
        from: owner,
      })
    ).toString();
    const payoutCreditsStaker5 = (
      await stakingInstance.getPayoutCredits(payoutCycle, staker5, {
        from: owner,
      })
    ).toString();

    await stakingInstance.distributeRewards({ from: owner });

    // Assert the rewards

    // Staker1
    const expectedRewardForStaker1 = await getExpectedReward(
      staker1,
      owner,
      payoutCreditsStaker1,
      payoutDay,
      payoutCycle,
      web3.utils.toWei('10000')
    );
    const actualRewardOfStaker1 = (
      await stakingInstance.rewardOf(staker1)
    ).toString();
    console.log(
      'Reward staker1',
      expectedRewardForStaker1 / 1000000000000000000
    );

    expect(
      Math.trunc(parseInt(actualRewardOfStaker1) / 1000000000000000000)
    ).to.be.equal(Math.trunc(expectedRewardForStaker1 / 1000000000000000000));

    // Staker2
    const expectedRewardForStaker2 = await getExpectedReward(
      staker2,
      owner,
      payoutCreditsStaker2,
      payoutDay,
      payoutCycle,
      web3.utils.toWei('10000')
    );
    const actualRewardOfStaker2 = (
      await stakingInstance.rewardOf(staker2)
    ).toString();
    console.log(
      'Reward staker2',
      expectedRewardForStaker2 / 1000000000000000000
    );

    expect(
      Math.trunc(parseInt(actualRewardOfStaker2) / 1000000000000000000)
    ).to.be.equal(Math.trunc(expectedRewardForStaker2 / 1000000000000000000));

    // Staker3
    const expectedRewardForStaker3 = await getExpectedReward(
      staker3,
      owner,
      payoutCreditsStaker3,
      payoutDay,
      payoutCycle,
      web3.utils.toWei('10000')
    );
    const actualRewardOfStaker3 = (
      await stakingInstance.rewardOf(staker3)
    ).toString();
    console.log(
      'Reward staker3',
      Math.trunc(expectedRewardForStaker3 / 1000000000000000000)
    );

    expect(
      Math.trunc(parseInt(actualRewardOfStaker3) / 1000000000000000000)
    ).to.be.equal(Math.trunc(expectedRewardForStaker3 / 1000000000000000000));

    // Staker4
    const expectedRewardForStaker4 = await getExpectedReward(
      staker4,
      owner,
      payoutCreditsStaker4,
      payoutDay,
      payoutCycle,
      web3.utils.toWei('10000')
    );
    const actualRewardOfStaker4 = (
      await stakingInstance.rewardOf(staker4)
    ).toString();
    console.log(
      'Reward staker4',
      Math.trunc(
        (expectedRewardForStaker4 + parseInt(web3.utils.toWei('5000'))) /
          1000000000000000000
      )
    );

    expect(
      Math.trunc(parseInt(actualRewardOfStaker4) / 1000000000000000000)
    ).to.be.equal(
      Math.trunc(
        (expectedRewardForStaker4 + parseInt(web3.utils.toWei('5000'))) / // Previous month reward
          1000000000000000000
      )
    );

    // Staker5
    const expectedRewardForStaker5 = await getExpectedReward(
      staker5,
      owner,
      payoutCreditsStaker5,
      payoutDay,
      payoutCycle,
      web3.utils.toWei('10000')
    );
    const actualRewardOfStaker5 = (
      await stakingInstance.rewardOf(staker5)
    ).toString();
    console.log(
      'Reward staker5',
      expectedRewardForStaker5 / 1000000000000000000
    );

    expect(
      Math.trunc(parseInt(actualRewardOfStaker5) / 1000000000000000000)
    ).to.be.equal(Math.trunc(expectedRewardForStaker5 / 1000000000000000000));
  });

  it('staker should be a stakeholder if their lockedDTX is 0 but staker has some payout credits', async () => {
    const [owner, staker1, staker2] = accounts;
    const firstStakeTimestamp = (await time.latest()).toString();

    // approve staker's DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('100'),
      { from: staker1 }
    );
    await stakingInstance.createStake(staker1, web3.utils.toWei('100'), {
      from: staker1,
    });

    // approve staker's DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('100'),
      { from: staker2 }
    );
    await stakingInstance.createStake(staker2, web3.utils.toWei('100'), {
      from: staker2,
    });

    // Time travel 15 days ahead
    await time.increase(time.duration.days(15));
    const removeStakeTimestamp = (await time.latest()).toString();

    await stakingInstance.removeStake(web3.utils.toWei('100'), {
      from: staker1,
    });

    const newLockedDTXOfStaker1 = (
      await stakingInstance.getLockedStakeDetails(staker1, {
        from: owner,
      })
    )[0].toString();

    expect(newLockedDTXOfStaker1).to.be.equal(web3.utils.toWei('0'));

    // Assert updated payout credit
    const payoutCreditsOfStaker1 = (
      await stakingInstance.getPayoutCredits(0, staker1, {
        from: owner,
      })
    ).toString();
    const expectedPayoutCredits =
      (removeStakeTimestamp - firstStakeTimestamp) * web3.utils.toWei('100');

    expect(parseInt(payoutCreditsOfStaker1)).to.be.equal(expectedPayoutCredits);

    // assert staker1 is stakeholder
    expect(
      (await stakingInstance.isStakeholder(staker1))[0].toString()
    ).to.be.equal('true');

    // Time travel 15 more days ahead to end of month
    await time.increase(time.duration.days(15));
    // const lastDayOfMonth = (await time.latest()).toString();

    // Add platform commission
    await dtxInstance.transfer(
      stakingInstance.address,
      web3.utils.toWei('5000'),
      { from: owner }
    );
    await stakingInstance.distributeRewards({ from: owner });

    // staker 1 should still be stakeholder
    expect(
      (await stakingInstance.isStakeholder(staker1))[0].toString()
    ).to.be.equal('true');

    // sstaker1 shouldn't be stakeholder after next distribute reward
    await dtxInstance.transfer(
      stakingInstance.address,
      web3.utils.toWei('5000'),
      { from: owner }
    );

    // Next month
    await time.increase(time.duration.days(30));

    await stakingInstance.distributeRewards({ from: owner });

    expect(
      (await stakingInstance.getTotalStakeholders({ from: owner })).toString()
    ).to.be.equal('1');
    expect(
      (await stakingInstance.isStakeholder(staker1))[0].toString()
    ).to.be.equal('false');
    expect(
      (await stakingInstance.isStakeholder(staker2))[0].toString()
    ).to.be.equal('true');
  });

  it('withdrawAllReward', async () => {
    const [owner, staker1, staker2] = accounts;

    // approve staker1 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker1 }
    );
    await stakingInstance.createStake(staker1, web3.utils.toWei('1000'), {
      from: staker1,
    });

    // approve staker2 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker2 }
    );
    await stakingInstance.createStake(staker2, web3.utils.toWei('1000'), {
      from: staker2,
    });

    // End of month
    await time.increase(time.duration.days(30));

    await dtxInstance.transfer(
      stakingInstance.address,
      web3.utils.toWei('10000'),
      { from: owner }
    );

    await stakingInstance.distributeRewards({ from: owner });

    // asset balane before withdrawAllReward
    expect((await dtxInstance.balanceOf(staker1)).toString()).to.be.equal(
      web3.utils.toWei('0')
    );
    expect((await dtxInstance.balanceOf(staker2)).toString()).to.be.equal(
      web3.utils.toWei('0')
    );

    await stakingInstance.withdrawAllReward({ from: owner });

    // asset balane after withdrawAllReward
    expect((await dtxInstance.balanceOf(staker1)).toString()).to.be.equal(
      web3.utils.toWei('5000')
    );
    expect((await dtxInstance.balanceOf(staker2)).toString()).to.be.equal(
      web3.utils.toWei('5000')
    );
  });

  it('withdrawReward', async () => {
    const [owner, staker1, staker2] = accounts;

    // approve staker1 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker1 }
    );
    await stakingInstance.createStake(staker1, web3.utils.toWei('1000'), {
      from: staker1,
    });

    // approve staker2 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker2 }
    );
    await stakingInstance.createStake(staker2, web3.utils.toWei('1000'), {
      from: staker2,
    });

    // End of month
    await time.increase(time.duration.days(30));

    await dtxInstance.transfer(
      stakingInstance.address,
      web3.utils.toWei('10000'),
      { from: owner }
    );

    await stakingInstance.distributeRewards({ from: owner });

    // asset balane before withdrawAllReward
    expect((await dtxInstance.balanceOf(staker1)).toString()).to.be.equal(
      web3.utils.toWei('0')
    );
    expect((await dtxInstance.balanceOf(staker2)).toString()).to.be.equal(
      web3.utils.toWei('0')
    );

    await stakingInstance.withdrawReward({ from: staker1 });
    await stakingInstance.withdrawReward({ from: staker2 });

    // asset balane after withdrawAllReward
    expect((await dtxInstance.balanceOf(staker1)).toString()).to.be.equal(
      web3.utils.toWei('5000')
    );
    expect((await dtxInstance.balanceOf(staker2)).toString()).to.be.equal(
      web3.utils.toWei('5000')
    );
  });

  it('getTotalStakeholders', async () => {
    const [owner, staker1, staker2] = accounts;

    // approve staker1 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker1 }
    );
    await stakingInstance.createStake(staker1, web3.utils.toWei('1000'), {
      from: staker1,
    });

    // approve staker2 DTX
    await dtxInstance.approve(
      stakingInstance.address,
      web3.utils.toWei('1000'),
      { from: staker2 }
    );
    await stakingInstance.createStake(staker2, web3.utils.toWei('1000'), {
      from: staker2,
    });

    expect(
      (await stakingInstance.getTotalStakeholders({ from: owner })).toString()
    ).to.be.equal('2');
  });
});
