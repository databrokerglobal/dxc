import {utils} from 'ethers';
import DTX from '../build/contracts/DTX.json';
import Staking from '../build/contracts/Staking.json';
import {use} from 'chai';
import {
  deployContract,
  MockProvider,
  solidity
} from 'ethereum-waffle';


//const {expectRevert} = require("@openzeppelin/test-helpers");

//const Staking: StakingContract = artifacts.require('Staking');

use(solidity);

describe('Staking', async () => {
  let stk: any;
  let dtxInstance: any;
  let wallet: any;
  let otherWallet: any;

  before(async () => {
    [wallet, otherWallet] = new MockProvider().getWallets();
    dtxInstance = await deployContract(wallet, DTX, [utils.parseUnits('999999')]);
    stk = await deployContract(wallet, Staking, [
      wallet.address,
      web3.utils.toWei('999999'),
      dtxInstance.address
    ])

    await dtxInstance.increaseAllowance(
      wallet.address,
      web3.utils.toWei('999999')
    );

    await dtxInstance.increaseAllowance(
      stk.address,
      web3.utils.toWei('999999')
    );

    await dtxInstance.transferFrom(wallet.address,
      stk.address, utils.parseUnits('1000'));
    });
    
    it('Staking contract address has balance', async () => {
      expect(
        await (await dtxInstance.balanceOf(stk.address)).toString()
        ).to.be.equal(utils.parseUnits('1000').toString()
      );
    });

    it('Monthly reward should equal to 1000', async () => {
      expect(
        await (await stk.monthlyReward()).toString()
      ).to.be.equal(utils.parseUnits('1000').toString());
    });

    it('Can create a stake', async () => {
      expect(
        await stk.createStake(
          wallet.address, 
          web3.utils.toWei('20'),
          {from: wallet.address})
      );
    });

    it('Can remove a stake', async () => {
      expect(
        await stk.removeStake(
          web3.utils.toWei('20'), 
          {from: wallet.address})
      );
    });


    it('Total stake should be 50', async () => {
      await dtxInstance.transferFrom(wallet.address,
        stk.address, web3.utils.toWei('1000'));
      const blockTime = await stk.getTimestamp();
      console.log(blockTime.toString());

      await stk.createStake(
        wallet.address,
        web3.utils.toWei('50'),
        {from: wallet.address}
      );
      
      expect(
        await (await stk.getTotalStakes()).toString()
        ).to.be.equal(web3.utils.toWei('50'));

      await stk.removeStake(
          web3.utils.toWei('50'), 
          {from: wallet.address}
      );
    });

    it('Random account should not be stakeholder', async () => {
      const isStakeholder = await stk.isStakeholder(otherWallet.address);
      expect(
          isStakeholder[0]
          ).to.be.equal(false);
    });


    it('Computes rewards for one stakeholder', async () => {
      /* 
      wallet create stake at 15th June for 1000 DTX
      wallet create another stake at 20th June for 2000 DTX
      otherWallet create stake at 20th for 500 DTX
      total deposited on the account for rewards: 12000 dtx
      total stake: 3500 DTX
      ----
      timestamp 15th June: 1623758400
      timestamp 20th June: 1624190400
      timestamp 30th June: 1625054400

      ----
      Distribute rewards at 30th June:
        => Reward of wallet: 
      */
        await stk.createStake(
          wallet.address,
          web3.utils.toWei('1000'),
          {from: wallet.address}
        );

        await stk.createStake(
          wallet.address,
          web3.utils.toWei('2000'),
          {from: wallet.address}
        );

        await dtxInstance.transferFrom(
          wallet.address,
          stk.address, 
          web3.utils.toWei('10000'));

        // total time stakeHolder : 216000
        // time stakeholder: 1623974400
        // stakeRatio: 1
        // durationRatio: 0.5
        // stakeShare: 10000
        // durationShare: 5000
        // reward: 75000

        // To viktor: can't compute computeReward as it is internal

        const totalTime = await stk.totalTime(1625054400);

        console.log(totalTime);
        await stk.distributeRewards(
          1625054400, 
          216000
        );

        const time = await stk.getTime(wallet.address);
        console.log(time.toString());

        const reward = await stk.rewardOf(wallet.address);
        console.log(reward.toString()); 
        expect(
            true
            ).to.be.equal(true);
    });

    it('Should forward in time', async () => {
      const time1 = await stk.getTimestamp();
      console.log(time1.toString());

      const timeTravel = require("./truffleTestHelper");
      await timeTravel(86000 * 2);
      const time2 = await stk.getTimestamp();
      console.log(time2.toString());
      expect(
        true
        ).to.be.equal(true);
    });


    // it('Distributes rewards', async () => {

    //     await stk.distributeRewards(web3.utils.toWei('30'));
    //     const rewardOf = await stk.rewardOf(accounts[0].toString());
    //     expect(
    //         web3.utils.toWei(rewardOf).toString()
    //         ).to.be.equal(web3.utils.toWei('330000000000000000000').toString());
    // });

    // it('Total rewards should be correct', async () => {

    //     await stk.distributeRewards(web3.utils.toWei('30'));
    //     const totalRewards = await stk.totalRewards();
    //     expect(
    //         web3.utils.toWei(totalRewards).toString()
    //         ).to.be.equal(web3.utils.toWei('660000000000000000000').toString());
    // });

    // it('Withraw all rewards check', async () => {

    //     await stk.distributeRewards(web3.utils.toWei('30'));
    //     await stk.withdrawAllReward();
    //     const rewardOf = await stk.rewardOf(accounts[0].toString());
    //     expect(
    //         web3.utils.toWei(rewardOf).toString()
    //         ).to.be.equal('0');
    // });

    // it('Full user workflow frow owner account', async () => {
    //     // To enable accounts[1] to trnasfer DTX
    //     await dtxInstance.increaseAllowance(
    //       accounts[1],
    //       web3.utils.toWei('1000')
    //     );

    //     // To enable transferFrom from the staking contract
    //     await dtxInstance.increaseAllowance(
    //         stk.address,
    //         web3.utils.toWei('1000')
    //       );

    //     // To create a monthly reward
    //     await dtxInstance.transferFrom(accounts[0],
    //         stk.address, web3.utils.toWei('1000'));
    //     // So that accounts[1] has funds
    //     await dtxInstance.transferFrom(accounts[0],
    //       accounts[1], web3.utils.toWei('1000'));

    //     await stk.createStake(web3.utils.toWei('1000'), web3.utils.toWei('20'));
    //     await stk.distributeRewards(web3.utils.toWei('30'));
    //     await stk.withdrawReward();
    //     const rewardOf = await stk.rewardOf(accounts[1].toString());

    //     expect(
    //         web3.utils.toWei(rewardOf).toString()
    //         ).to.be.equal('0');
    // });

    // it("should revert distributeRewards if the msg.sender is not the owner", async () => {
    //   await expectRevert(
    //     stk.distributeRewards(
    //       utils.parseUnits('1624290217'), 
    //       await stk.totalTime(utils.parseUnits('1624290217')),
    //       {from: otherWallet}),
    //     "Ownable: caller is not the owner"
    //   );
    // });

    // it("should revert withdrawAllreward if the msg.sender is not the owner", async () => {
    //   await expectRevert(
    //     stk.withdrawAllReward({from: otherWallet.address}),
    //     "Ownable: caller is not the owner"
    //   );
    // });

    // it("should revert createStaKe if the msg.sender does not have enough allowance", async () => {
    //   await expectRevert(
    //     stk.createStake(web3.utils.toWei('1000'),web3.utils.toWei('20'), {from: accounts[2]}),
    //     "VM Exception while processing transaction: revert Not enough DTX to stake"
    //   );
    // });

    // it("should revert removeStake if the msg.sender does not have stake before or not enough staked", async () => {
    //   await expectRevert(
    //     stk.removeStake(web3.utils.toWei('1000'), {from: accounts[1]}),
    //     "VM Exception while processing transaction: revert Not enough staked!"
    //   );
    // });

    // it('Full user workflow from different account than owner account', async () => {
    //   await dtxInstance.transferFrom(accounts[0],
    //     stk.address, web3.utils.toWei('1000'));

    //   await dtxInstance.transferFrom(accounts[0],
    //       accounts[1], web3.utils.toWei('1000'));

    //   await dtxInstance.approve(
    //         accounts[1],
    //         web3.utils.toWei('2000'),
    //         {from: accounts[0]}
    //       );

    //   await dtxInstance.increaseAllowance(
    //         accounts[1],
    //         web3.utils.toWei('2000'),
    //         {from: accounts[0]}
    //       );
    //   await dtxInstance.increaseAllowance(
    //         stk.address,
    //         web3.utils.toWei('2000'),
    //         {from: accounts[0]}
    //       );
    //   await stk.createStake(web3.utils.toWei('100'), web3.utils.toWei('20'), {from: accounts[1]});
    //   await stk.distributeRewards(web3.utils.toWei('30'));
    //   await stk.withdrawAllReward({from: accounts[0]});
    //   const rewardOf = await stk.rewardOf(accounts[1].toString());

    //   expect(
    //       web3.utils.toWei(rewardOf).toString()
    //       ).to.be.equal('0');
    // });
});
