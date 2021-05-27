import {
    DTXContract,
    DTXInstance, StakingContract,
    StakingInstance
} from '../types/truffle-contracts';

const {expectRevert} = require("@openzeppelin/test-helpers");

const Staking: StakingContract = artifacts.require('Staking');
const DTX: DTXContract = artifacts.require('DTX');

contract('Staking', async accounts => {
    describe('Staking', async () => {
        let dtxInstance: DTXInstance;
        let stk: StakingInstance;
        

    before(async () => {
        dtxInstance = await DTX.new(accounts[0], web3.utils.toWei('10000000'));
        stk = await Staking.new(accounts[0], web3.utils.toWei('10000000'), dtxInstance.address);

        await dtxInstance.increaseAllowance(
            accounts[0],
            web3.utils.toWei('10000000')
          );
        
        await dtxInstance.increaseAllowance(
            stk.address,
            web3.utils.toWei('10000000')
          );


        await dtxInstance.transferFrom(accounts[0],
            stk.address, web3.utils.toWei('1000'));
    });

    it('Staking contract address has balance', async () => {
        expect(
          await (await dtxInstance.balanceOf(stk.address)).toString()
        ).to.be.equal(web3.utils.toWei('1000'));
    });

    it('Montly reward should equal to 1000', async () => {
        expect(
          await (await stk.monthlyReward()).toString()
        ).to.be.equal(web3.utils.toWei('1000'));
    });

    it('Can create a stake', async () => {
        expect(
            await stk.createStake(web3.utils.toWei('1000'), web3.utils.toWei('20')));

    });

    it('Can remove a stake', async () => {
        expect(
            await stk.removeStake(web3.utils.toWei('1000')));
    });

    it('Total stake should be 1000', async () => {
        await stk.createStake(web3.utils.toWei('1000'), web3.utils.toWei('20'));
        expect(
            await (await stk.monthlyReward()).toString()
            ).to.be.equal(web3.utils.toWei('1000'));
    });

    it('Random account should not be stakeholder', async () => {
      const isStakeholder = ((await stk.isStakeholder(accounts[1])));
      expect(
          isStakeholder[0]
          ).to.be.equal(false);
    });

    it('Calculate dummy PandL', async () => {
        // Total stake: 2000
        // Monthly reward: 1000
        // Stake of account[0]: 2000
        // Ratio time staking remained on the program: 
        // - Staking time: 10
        // PandL = 1000 * (2000/2000) * (30-20/30) 
        // Attention: I have a decimal issue that's why the BN

        await stk.createStake(web3.utils.toWei('1000'), web3.utils.toWei('20'));
        expect(
            await web3.utils.toWei(await (await stk.calculateReward(accounts[0], web3.utils.toWei('30'))).toString())
            ).to.be.equal(web3.utils.toWei('330000000000000000000'));
    });
      

    it('Distributes rewards', async () => {

        await stk.distributeRewards(web3.utils.toWei('30'));  
        const rewardOf = await stk.rewardOf(accounts[0].toString());        
        expect(
            web3.utils.toWei(rewardOf).toString()
            ).to.be.equal(web3.utils.toWei('330000000000000000000').toString());
    }); 

    it('Total rewards should be correct', async () => {

        await stk.distributeRewards(web3.utils.toWei('30'));  
        const totalRewards = await stk.totalRewards();     
        expect(
            web3.utils.toWei(totalRewards).toString()
            ).to.be.equal(web3.utils.toWei('660000000000000000000').toString());
    }); 

    it('Withraw all rewards check', async () => {

        await stk.distributeRewards(web3.utils.toWei('30'));  
        await stk.withdrawAllReward();  
        const rewardOf = await stk.rewardOf(accounts[0].toString());      
        expect(
            web3.utils.toWei(rewardOf).toString()
            ).to.be.equal('0');
    });

    it('Full user workflow', async () => {
        // To enable accounts[1] to trnasfer DTX
        await dtxInstance.increaseAllowance(
          accounts[1],
          web3.utils.toWei('1000')
        );
        
        // To enable transferFrom from the staking contract
        await dtxInstance.increaseAllowance(
            stk.address,
            web3.utils.toWei('1000')
          );

        // To create a monthly reward
        await dtxInstance.transferFrom(accounts[0],
            stk.address, web3.utils.toWei('1000'));
        // So that accounts[1] has funds
        await dtxInstance.transferFrom(accounts[0],
          accounts[1], web3.utils.toWei('1000'));

        await stk.createStake(web3.utils.toWei('1000'), web3.utils.toWei('20'));
        await stk.distributeRewards(web3.utils.toWei('30'));  
        await stk.withdrawReward();
        const rewardOf = await stk.rewardOf(accounts[1].toString()); 

        expect(
            web3.utils.toWei(rewardOf).toString()
            ).to.be.equal('0');
    });

    it("should revert distributeRewards if the msg.sender is not the owner", async () => {
      await expectRevert(
        stk.distributeRewards(20, {from: accounts[1]}),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert withdrawAllreward if the msg.sender is not the owner", async () => {
      await expectRevert(
        stk.withdrawAllReward({from: accounts[1]}),
        "Ownable: caller is not the owner"
      );
    });

    it("should revert createStage if the msg.sender does not have enough allowance", async () => {
      await expectRevert(
        stk.createStake(web3.utils.toWei('1000'),web3.utils.toWei('20'), {from: accounts[1]}),
        "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance"
      );
    });

    it("should revert removeStake if the msg.sender does not have stake before or not enough staked", async () => {
      await expectRevert(
        stk.removeStake(web3.utils.toWei('1000'), {from: accounts[1]}),
        "VM Exception while processing transaction: revert Not enough staked!"
      );
    });

    it('Full user workflow', async () => {
      // To enable accounts[1] to trnasfer DTX
      await dtxInstance.increaseAllowance(
        accounts[0],
        web3.utils.toWei('1000000000'), {from: accounts[0]}
      );
      await dtxInstance.increaseAllowance(
        accounts[1],
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );
      await dtxInstance.increaseAllowance(
        stk.address,
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );
      await dtxInstance.increaseAllowance(
        dtxInstance.address,
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );

      await stk.increaseAllowance(
        accounts[0],
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );
      await stk.increaseAllowance(
        accounts[1],
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );
      await stk.increaseAllowance(
        stk.address,
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );

      await stk.increaseAllowance(
        dtxInstance.address,
        web3.utils.toWei('100000000'), {from: accounts[0]}
      );

      console.log((await dtxInstance.allowance(accounts[0], accounts[1])).toString());
      console.log((await stk.allowance(accounts[0], accounts[1])).toString());
      console.log((await dtxInstance.allowance(accounts[0], stk.address)).toString());

      // To enable transferFrom from the staking contract


      // To create a monthly reward
      await dtxInstance.transferFrom(accounts[0],
          stk.address, web3.utils.toWei('1000'));

      // So that accounts[1] has funds
      await dtxInstance.transferFrom(accounts[0],
        accounts[1], web3.utils.toWei('1000'));

      await stk.createStake(web3.utils.toWei('100'), web3.utils.toWei('20'), {from: accounts[1]});
      await stk.distributeRewards(web3.utils.toWei('30'), {from: accounts[0]} );  
      await stk.withdrawAllReward({from: accounts[0]});
      const rewardOf = await stk.rewardOf(accounts[1].toString()); 

      expect(
          web3.utils.toWei(rewardOf).toString()
          ).to.be.equal('0');
    });
  });
});
