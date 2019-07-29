import { expect } from 'chai';
import {
  BN,
  constants,
  expectEvent,
  expectRevert,
} from 'openzeppelin-test-helpers';
import {
  DTXTokenContract,
  DTXTokenInstance,
  DXCContract,
  DXCInstance,
  MiniMeTokenFactoryContract,
} from '../types/truffle-contracts/index';
import { getLatestQuote } from './helpers/getLatestQuote';

const DXC: DXCContract = artifacts.require('DXC');
const DTXToken: DTXTokenContract = artifacts.require('DTXToken');
const MiniMeTokenFactory: MiniMeTokenFactoryContract = artifacts.require(
  'MiniMeTokenFactory'
);

contract('DXC', (accounts: string[]) => {
  let amountOfDTXFor100USD: BN;

  before(async () => {
    const latestQuote: number = await getLatestQuote();
    amountOfDTXFor100USD = new BN(100 / latestQuote);
  });

  beforeEach(async () => {
    // handle setup before each test
  });

  describe('DXC general', async () => {
    let dDTXToken: DTXTokenInstance;
    let dDXC: DXCInstance;

    beforeEach(async () => {
      const dMiniMeTokenFactory = await MiniMeTokenFactory.deployed();
      dDTXToken = await DTXToken.new(dMiniMeTokenFactory.address);
      dDXC = await DXC.new(dDTXToken.address);
      for (const address of accounts) {
        await dDTXToken.generateTokens(address, web3.utils.toWei('1000000'));
      }
    });

    it('create a new DXC', async () => {
      assert.exists(dDXC);
      expect(await dDXC.protocolPercentage()).to.be.bignumber.equal(new BN(5));
      expect(await dDXC.dtxToken()).to.equal(dDTXToken.address);
    });

    it('change the protocol percentage', async () => {
      expect(await dDXC.protocolPercentage()).to.be.bignumber.equal(new BN(5));
      await dDXC.changeProtocolPercentage(new BN(99));
      expect(await dDXC.protocolPercentage()).to.be.bignumber.equal(new BN(99));
    });

    it('change the token address', async () => {
      expect(await dDXC.dtxToken()).to.equal(dDTXToken.address);
      await dDXC.changeDTXToken(accounts[1]);
      expect(await dDXC.dtxToken()).to.equal(accounts[1]);
    });
  });

  describe('DXC bank', async () => {
    let dDTXToken: DTXTokenInstance;
    let dDXC: DXCInstance;

    beforeEach(async () => {
      const dMiniMeTokenFactory = await MiniMeTokenFactory.deployed();
      dDTXToken = await DTXToken.new(dMiniMeTokenFactory.address);
      dDXC = await DXC.new(dDTXToken.address);
      await dDTXToken.generateTokens(dDXC.address, web3.utils.toWei('1000000'));
      for (const address of accounts) {
        await dDTXToken.generateTokens(address, web3.utils.toWei('1000000'));
      }
    });

    it('can have and read the platform balance', async () => {
      expect(await dDXC.platformBalance()).to.be.bignumber.equal(
        web3.utils.toWei('1000000')
      );
    });

    it('can read the balance of someone internally', async () => {
      const balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
    });

    it('can convert from fiat money', async () => {
      let balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      await dDXC.convertFiatToToken(
        accounts[1],
        web3.utils.toWei(amountOfDTXFor100USD)
      );
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor100USD)
      );
    });

    it('can deposit DTX tokens', async () => {
      let balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      await dDTXToken.approve(
        dDXC.address,
        web3.utils.toWei(amountOfDTXFor100USD),
        { from: accounts[1] }
      );
      const allowanceResult = await dDTXToken.allowance(
        accounts[1],
        dDXC.address
      );
      expect(allowanceResult).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor100USD)
      );
      await dDXC.deposit(web3.utils.toWei(amountOfDTXFor100USD), {
        from: accounts[1],
      });
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor100USD)
      );
    });

    it('can withdraw DTX tokens', async () => {
      // deposit first, equal to the test above
      let balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      await dDTXToken.approve(
        dDXC.address,
        web3.utils.toWei(amountOfDTXFor100USD),
        { from: accounts[1] }
      );
      const allowanceResult = await dDTXToken.allowance(
        accounts[1],
        dDXC.address
      );
      expect(allowanceResult).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor100USD)
      );
      await dDXC.deposit(web3.utils.toWei(amountOfDTXFor100USD), {
        from: accounts[1],
      });
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor100USD)
      );
      // now withdraw
      await dDXC.withdraw({
        from: accounts[1],
      });
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
    });
  });

  // describe('a grouping of tests', async () => {
  //   beforeEach(async () => {
  //     // handle setup before each test in this group
  //   });

  //   it('describe your test here', async () => {
  //     // test here
  //   });

  //   it('this is a test for a failure', async () => {
  //     try {
  //       // here you call a contract function
  //       const fakeError = new Error('fake error');
  //       (fakeError as any).reason =
  //         'here you define the revert message you expect';
  //       throw fakeError;
  //       assert(false, 'Test succeeded when it should have failed');
  //     } catch (error) {
  //       assert(
  //         error.reason === 'here you define the revert message you expect',
  //         error.reason
  //       );
  //     }
  //   });
  // });
});
