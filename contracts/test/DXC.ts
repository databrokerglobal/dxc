import { expect } from 'chai';
import { BN } from 'openzeppelin-test-helpers';
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
  let latestQuote: number;

  function amountOfDTXFor(amountInUSD: number) {
    return new BN(amountInUSD / latestQuote);
  }

  before(async () => {
    latestQuote = await getLatestQuote();
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
      await dDTXToken.generateTokens(dDXC.address, web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[0], web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[1], web3.utils.toWei('1000000'));
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

  describe('Getting DTX token in the bank', async () => {
    let dDTXToken: DTXTokenInstance;
    let dDXC: DXCInstance;

    beforeEach(async () => {
      const dMiniMeTokenFactory = await MiniMeTokenFactory.deployed();
      dDTXToken = await DTXToken.new(dMiniMeTokenFactory.address);
      dDXC = await DXC.new(dDTXToken.address);
      await dDTXToken.generateTokens(dDXC.address, web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[0], web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[1], web3.utils.toWei('1000000'));
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
        web3.utils.toWei(amountOfDTXFor(100))
      );
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(100))
      );
    });

    it('cannot convert from fiat money if the user is not the owner', async () => {
      let balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      try {
        await dDXC.convertFiatToToken(
          accounts[1],
          web3.utils.toWei(amountOfDTXFor(100)),
          { from: accounts[9] }
        );
        assert(false, 'Test succeeded when it should have failed');
      } catch (error) {
        assert(
          error.reason === 'Ownable: caller is not the owner',
          error.reason
        );
      }
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
    });

    it('can deposit DTX tokens', async () => {
      let balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      await dDTXToken.approve(
        dDXC.address,
        web3.utils.toWei(amountOfDTXFor(100)),
        { from: accounts[1] }
      );
      const allowanceResult = await dDTXToken.allowance(
        accounts[1],
        dDXC.address
      );
      expect(allowanceResult).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(100))
      );
      await dDXC.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
        from: accounts[1],
      });
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(100))
      );
    });

    it('cannot deposit DTX tokens if the allowance is too little', async () => {
      let balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      await dDTXToken.approve(dDXC.address, new BN('5'), { from: accounts[1] });
      const allowanceResult = await dDTXToken.allowance(
        accounts[1],
        dDXC.address
      );
      expect(allowanceResult).to.be.bignumber.equal(new BN('5'));
      try {
        await dDXC.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
          from: accounts[1],
        });
      } catch (error) {
        assert(
          error.reason === 'DTX transfer failed, probably too little allowance',
          error.reason
        );
      }
      balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
    });

    it('cannot deposit DTX tokens if their is not enough DTX available', async () => {
      let balanceResult = await dDXC.balanceOf(accounts[3]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
      await dDTXToken.approve(
        dDXC.address,
        web3.utils.toWei(amountOfDTXFor(100)),
        { from: accounts[3] }
      );
      const allowanceResult = await dDTXToken.allowance(
        accounts[3],
        dDXC.address
      );
      expect(allowanceResult).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(100))
      );
      try {
        await dDXC.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
          from: accounts[3],
        });
      } catch (error) {
        assert(
          error.reason ===
            'Sender has too little DTX to make this transaction work',
          error.reason
        );
      }
      balanceResult = await dDXC.balanceOf(accounts[3]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
    });
  });

  describe('Get DTX tokens out of the bank', async () => {
    let dDTXToken: DTXTokenInstance;
    let dDXC: DXCInstance;

    beforeEach(async () => {
      const dMiniMeTokenFactory = await MiniMeTokenFactory.deployed();
      dDTXToken = await DTXToken.new(dMiniMeTokenFactory.address);
      dDXC = await DXC.new(dDTXToken.address);
      await dDTXToken.generateTokens(dDXC.address, web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[0], web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[1], web3.utils.toWei('1000000'));
      await dDTXToken.approve(
        dDXC.address,
        web3.utils.toWei(amountOfDTXFor(100)),
        { from: accounts[1] }
      );
      await dDTXToken.allowance(accounts[1], dDXC.address);
      await dDXC.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
        from: accounts[1],
      });
    });

    it('can withdraw DTX tokens', async () => {
      await dDXC.withdraw({
        from: accounts[1],
      });
      const balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(new BN(0));
    });
  });

  describe('Manage deals', async () => {
    let dDTXToken: DTXTokenInstance;
    let dDXC: DXCInstance;

    beforeEach(async () => {
      const dMiniMeTokenFactory = await MiniMeTokenFactory.deployed();
      dDTXToken = await DTXToken.new(dMiniMeTokenFactory.address);
      dDXC = await DXC.new(dDTXToken.address);
      await dDTXToken.generateTokens(dDXC.address, web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[0], web3.utils.toWei('1000000'));
      await dDTXToken.generateTokens(accounts[1], web3.utils.toWei('1000000'));
      await dDTXToken.approve(
        dDXC.address,
        web3.utils.toWei(amountOfDTXFor(100)),
        { from: accounts[1] }
      );
      await dDTXToken.allowance(accounts[1], dDXC.address);
      await dDXC.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
        from: accounts[1],
      });
    });

    it('can create a new deal only when the percentages add up to 100', async () => {
      try {
        await dDXC.createDeal(
          'did:dxc:12345',
          accounts[1],
          new BN('70'),
          accounts[2],
          new BN('10'),
          accounts[3],
          accounts[0],
          new BN('10'),
          web3.utils.toWei(amountOfDTXFor(50)),
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000) + 3600 * 24 * 30
        );
      } catch (error) {
        assert(
          error.reason === 'All percentages need to add up to exactly 100',
          error.reason
        );
      }
    });

    it('can create a new deal', async () => {
      const { logs } = await dDXC.createDeal(
        'did:dxc:12345',
        accounts[3],
        new BN('70'),
        accounts[2],
        new BN('10'),
        accounts[1],
        accounts[0],
        new BN('15'),
        web3.utils.toWei(amountOfDTXFor(50)),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 3600 * 24 * 30
      );
      expect(testEvent(logs, 'NewDeal', 'did', 'did:dxc:12345'));
      const balanceResult = await dDXC.balanceOf(accounts[1]);
      expect(balanceResult[0]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(100))
      );
      expect(balanceResult[1]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(50))
      );
      expect(balanceResult[3]).to.be.bignumber.equal(
        web3.utils.toWei(amountOfDTXFor(100).sub(amountOfDTXFor(50)))
      );
    });

    it('can list all deals', async () => {
      await dDXC.createDeal(
        'did:dxc:12345',
        accounts[3],
        new BN('70'),
        accounts[2],
        new BN('10'),
        accounts[1],
        accounts[0],
        new BN('15'),
        web3.utils.toWei(amountOfDTXFor(50)),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 3600 * 24 * 30
      );
      const deals = await dDXC.allDeals();
      expect(deals.length).to.be.equal(1);
    });

    it('can get the info for a deal', async () => {
      await dDXC.createDeal(
        'did:dxc:12345',
        accounts[3],
        new BN('70'),
        accounts[2],
        new BN('10'),
        accounts[1],
        accounts[0],
        new BN('15'),
        web3.utils.toWei(amountOfDTXFor(50)),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 3600 * 24 * 30
      );
      const deal = await dDXC.deal(0);
      expect(deal.did).to.be.equal('did:dxc:12345');
    });

    it('can get all the deals for a did', async () => {
      await dDXC.createDeal(
        'did:dxc:12345',
        accounts[3],
        new BN('70'),
        accounts[2],
        new BN('10'),
        accounts[1],
        accounts[0],
        new BN('15'),
        web3.utils.toWei(amountOfDTXFor(50)),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 3600 * 24 * 30
      );
      await dDXC.createDeal(
        'did:dxc:12345',
        accounts[3],
        new BN('70'),
        accounts[2],
        new BN('10'),
        accounts[1],
        accounts[0],
        new BN('15'),
        web3.utils.toWei(amountOfDTXFor(50)),
        Math.floor(Date.now() / 1000),
        Math.floor(Date.now() / 1000) + 3600 * 24 * 30
      );
      const deals = await dDXC.deals('did:dxc:12345');
      expect(deals).to.be.length(2);
    });
  });
});

function testEvent(
  logs: Truffle.TransactionLog[],
  eventName: string,
  field: string,
  value: any
) {
  return (
    logs.filter(log => log.event === eventName && log.args[field] === value)
      .length > 0
  );
}
