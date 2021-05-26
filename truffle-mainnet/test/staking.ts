import {
    DTXContract,
    DTXInstance, StakingContract,
    StakingInstance
} from '../types/truffle-contracts';


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
            await stk.createStake(web3.utils.toWei('1000')));

      });

    it('Can remove a stake', async () => {
        expect(
            await stk.removeStake(web3.utils.toWei('1000')));
      });

    it('Total stake should be 1000', async () => {
        await stk.createStake(web3.utils.toWei('1000'));
        expect(
            await (await stk.monthlyReward()).toString()
            ).to.be.equal(web3.utils.toWei('1000'));
    });

    it('Calculate dummy PandL', async () => {
        // Total stake: 2000
        // Monthly reward: 1000
        // Stake of account[0]: 2000
        // Ratio time staking remained on the program: 
        // - Lastest block timestamp: 25
        // - Staking time: 25 - 2 days
        // PandL = 1000 * (2000/2000) * 0.00 = 0

        await stk.createStake(web3.utils.toWei('1000'));
        console.log((await stk.totalStakes()).toString());
        console.log((await stk.stakeOf(accounts[0])).toString());
        console.log((await stk.monthlyReward()).toString());
        await stk.changeTimeStake(1621526293, accounts[0]);
        console.log(1621526293);
        console.log((await stk.getDay(1621526293)).toString());
        console.log((await stk.getStakeTime(accounts[0])).toString());
        console.log((await stk.getBlockTimestamp()).toString());
        console.log()
        expect(
            await web3.utils.toWei(await (await stk.calculateReward(accounts[0])).toString())
            ).to.be.equal(web3.utils.toWei('240'));
    });
      
/*     it('Calculate example PandL', async () => {
        // The same as above but with different dates
        await stk.createStake(web3.utils.toWei('1000'));
        console.log(await (await stk.totalStakes().toString()));
        //let stakingTime  = 25;
        //let endMonth = 30;
        let stake =  await stk.stakeOf(accounts[0]);
        let totalStakes :BN  =  await stk.totalStakes();
        let monthlyReward :BN = await stk.monthlyReward();
        
        const reward = monthlyReward * (stake/totalStakes) 
        console.log(reward);
        expect(
            reward
            ).to.be.equal('0');
    });  */

    it('Distributes rewards', async () => {
        await dtxInstance.transferFrom(accounts[0],
            stk.address, web3.utils.toWei('1000'));
        await stk.changeTimeStake(1621526293, accounts[0]);
        await stk.distributeRewards();  
        const rewardOf = await stk.rewardOf(accounts[0].toString());
        //console.log(web3.utils.toWei(rewardOf));
        
        expect(
            rewardOf
            ).to.be.equal('99');
      }); 

    });
});
