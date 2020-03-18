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

    beforeEach(async () => {
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
    });

    it('Should have a platform balance', async () => {
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

      expect(await (await proxiedDxc.platformBalance()).toString()).to.be.equal(
        web3.utils.toWei('1000000')
      );
    });

    it('Can read the balance of someone internally', async () => {
      const balanceResult = await proxiedDxc.balanceOf(accounts[1]);
      expect(balanceResult[0].toString()).to.be.equal('0');
    });

    // it('Can convert from fiat money', async () => {
    //   let balanceResult = await proxiedDxc.balanceOf(accounts[1]);
    //   expect(balanceResult[0].toString()).to.be.equal('0');
    //   await proxiedDxc.convertFiatToToken(
    //     accounts[1],
    //     web3.utils.toWei(amountOfDTXFor(100))
    //   );
    //   balanceResult = await dDXC.balanceOf(accounts[1]);
    //   expect(balanceResult[0]).to.be.bignumber.equal(
    //     web3.utils.toWei(amountOfDTXFor(100))
    //   );
    // });

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

    it('Blacklisting should work', async () => {
      // Owner cannot be blacklisted
      const blackListErr: string = await proxiedDxc
        .addToBlackList(accounts[0])
        .catch(err => err);

      assert.isTrue(
        String(blackListErr).includes(
          'VM Exception while processing transaction: revert Owner cannot be blacklisted'
        )
      );

      // Add other user to blacklist
      assert.isOk(await proxiedDxc.addToBlackList(accounts[1]));

      const cannotWithdrawErr = await proxiedDxc
        .withdraw({from: accounts[1]})
        .catch(err => err);
      assert.isTrue(
        String(cannotWithdrawErr).includes(
          'VM Exception while processing transaction: revert User is blacklisted'
        )
      );

      // Remove from blacklist
      assert.isOk(await proxiedDxc.removeFromBlackList(accounts[1]));
      assert.isOk(await proxiedDxc.withdraw({from: accounts[1]}));
    });
  });
});
