import BN from 'bn.js';

import {
  DTXTokenContract,
  DTXTokenInstance,
  DXCContract,
  DXCInstance,
  MiniMeTokenFactoryContract,
  MiniMeTokenFactoryInstance,
  OwnedUpgradeabilityProxyContract,
  OwnedUpgradeabilityProxyInstance,
} from '../types/truffle-contracts';

import {encodeCall} from './utils/encodeCall';
import {getLatestQuote} from './utils/getLatestQuote';

const TF: MiniMeTokenFactoryContract = artifacts.require('MiniMeTokenFactory');
const DTX: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');
const OUP: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);

contract('DXC', async accounts => {
  describe('DXC functionalities', async () => {
    let tfInstance: MiniMeTokenFactoryInstance;
    let dtxInstance: DTXTokenInstance;
    let dxcInstance: DXCInstance;
    let oUPinstance: OwnedUpgradeabilityProxyInstance;
    let proxiedDxc: DXCInstance;
    let latestQuote: number;

    function amountOfDTXFor(amountInUSD: number) {
      return new BN(amountInUSD / latestQuote);
    }

    before(async () => {
      latestQuote = await getLatestQuote();

      tfInstance = await TF.new();
      dtxInstance = await DTX.new(tfInstance.address);

      dxcInstance = await DXC.new();
      oUPinstance = await OUP.new();

      // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
      const data = encodeCall('initialize', ['address'], [dtxInstance.address]);

      // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
      assert.isOk(
        await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
          from: accounts[0],
        })
      );

      // Intitialize the proxied dxc instance
      proxiedDxc = await DXC.at(oUPinstance.address);

      await dtxInstance.generateTokens(
        proxiedDxc.address,
        web3.utils.toWei('1000000')
      );

      await dtxInstance.generateTokens(
        accounts[0],
        web3.utils.toWei('1000000')
      );

      await dtxInstance.generateTokens(
        accounts[1],
        web3.utils.toWei('1000000')
      );

      await proxiedDxc.platformDeposit(web3.utils.toWei('1000000'));
    });

    it('Should have a platform balance', async () => {
      expect(await (await proxiedDxc.platformBalance()).toString()).to.be.equal(
        web3.utils.toWei('1000000')
      );
    });

    it('Can read the balance of someone internally', async () => {
      const balanceResult = await proxiedDxc.balanceOf(accounts[0]);
      expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
    });

    it('Can convert from fiat money', async () => {
      let balanceResult = await proxiedDxc.balanceOf(accounts[1]);
      expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
      await proxiedDxc.convertFiatToToken(
        accounts[1],
        web3.utils.toWei(amountOfDTXFor(1))
      );
      balanceResult = await proxiedDxc.balanceOf(accounts[1]);
      expect(balanceResult[0].toString()).to.be.equal(
        web3.utils.toWei(amountOfDTXFor(1).toString())
      );
    });

    it('Cannot convert from fiat money if the user is not the owner', async () => {
      let balanceResult = await proxiedDxc.balanceOf(accounts[2]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
      try {
        await proxiedDxc.convertFiatToToken(
          accounts[2],
          web3.utils.toWei(amountOfDTXFor(100)),
          {from: accounts[9]}
        );
        assert(false, 'Test succeeded when it should have failed');
      } catch (error) {
        assert.isTrue(error.toString().includes('caller is not the owner'));
      }
      balanceResult = await proxiedDxc.balanceOf(accounts[2]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
    });

    it('can deposit DTX tokens', async () => {
      await dtxInstance.generateTokens(
        accounts[3],
        web3.utils.toWei('1000000')
      );

      let balanceResult = await proxiedDxc.balanceOf(accounts[3]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
      await dtxInstance.approve(
        proxiedDxc.address,
        web3.utils.toWei(amountOfDTXFor(100)),
        {from: accounts[3]}
      );
      const allowanceResult = await dtxInstance.allowance(
        accounts[3],
        proxiedDxc.address
      );
      expect(allowanceResult.toString()).to.be.equal(
        web3.utils.toWei(amountOfDTXFor(100).toString())
      );
      await proxiedDxc.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
        from: accounts[3],
      });
      balanceResult = await proxiedDxc.balanceOf(accounts[3]);
      expect(balanceResult[0].toString()).to.be.equal(
        web3.utils.toWei(amountOfDTXFor(100).toString())
      );
    });

    it('Cannot deposit DTX tokens if the allowance is too little', async () => {
      await dtxInstance.generateTokens(
        accounts[4],
        web3.utils.toWei(amountOfDTXFor(100))
      );
      let balanceResult = await proxiedDxc.balanceOf(accounts[4]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
      await dtxInstance.approve(proxiedDxc.address, new BN('5'), {
        from: accounts[4],
      });
      const allowanceResult = await dtxInstance.allowance(
        accounts[4],
        proxiedDxc.address
      );
      expect(allowanceResult.toString()).to.be.equal(new BN('5').toString());
      try {
        await proxiedDxc.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
          from: accounts[4],
        });
      } catch (error) {
        assert.isTrue(error.toString().includes('too little allowance'));
      }
      balanceResult = await proxiedDxc.balanceOf(accounts[4]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
    });

    it('Cannot deposit DTX tokens if their is not enough DTX available', async () => {
      let balanceResult = await proxiedDxc.balanceOf(accounts[5]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
      await dtxInstance.approve(
        proxiedDxc.address,
        web3.utils.toWei(amountOfDTXFor(100)),
        {from: accounts[5]}
      );
      const allowanceResult = await dtxInstance.allowance(
        accounts[5],
        proxiedDxc.address
      );
      expect(allowanceResult.toString()).to.be.equal(
        web3.utils.toWei(amountOfDTXFor(100).toString())
      );
      try {
        await proxiedDxc.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
          from: accounts[5],
        });
      } catch (error) {
        assert.isTrue(error.toString().includes('too little DTX'));
      }
      balanceResult = await proxiedDxc.balanceOf(accounts[5]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
    });

    it('Can withdraw DTX tokens', async () => {
      const balanceResult1 = await proxiedDxc.balanceOf(accounts[1]);
      assert.isTrue(balanceResult1[0].toString() !== '0');
      await proxiedDxc.withdraw({
        from: accounts[1],
      });
      const balanceResult = await proxiedDxc.balanceOf(accounts[1]);
      expect(balanceResult[0].toString()).to.be.equal(new BN(0).toString());
    });

    it('Should create a deal successfully', async () => {
      // All percentages here need to add up to a 100: 15 + 70 + 10 = 95 + protocol percentage 5 = 100
      await proxiedDxc.createDeal(
        'did:databroker:deal2:weatherdata',
        accounts[1],
        15,
        accounts[2],
        70,
        accounts[3],
        accounts[4],
        10,
        5,
        0,
        0
      );
    });

    it('can create a new deal only when the percentages add up to 100', async () => {
      try {
        await proxiedDxc.createDeal(
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
        assert.isTrue(
          error
            .toString()
            .includes('All percentages need to add up to exactly 100')
        );
      }
    });

    it('can list all deals', async () => {
      await proxiedDxc.createDeal(
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
      const deals = await proxiedDxc.allDeals();
      expect(deals.length).to.be.equal(2);
    });

    it('can get the info for a deal', async () => {
      await proxiedDxc.createDeal(
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
      const deal = await proxiedDxc.getDealByIndex(2);
      expect(deal.did).to.be.equal('did:dxc:12345');
    });
  });
});
