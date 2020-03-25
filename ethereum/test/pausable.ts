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

contract('Pausable', accounts => {
  describe('Test pausable functionalities', () => {
    let proxiedDxc: DXCInstance;
    before('Init env', async () => {
      const tfInstance: MiniMeTokenFactoryInstance = await TF.new();
      const dtxInstance: DTXTokenInstance = await DTX.new(tfInstance.address);
      const dxcInstance: DXCInstance = await DXC.new();
      const oUPinstance: OwnedUpgradeabilityProxyInstance = await OUP.new();

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

    it('Initial state cannot be changed', async () => {
      try {
        await proxiedDxc.initPause();
      } catch (error) {
        error.toString().includes('Transaction reverted');
      }
    });

    it('When not paused everything works as expected', async () => {
      assert.isFalse(await proxiedDxc.paused());
      assert.isOk(await proxiedDxc.changeProtocolPercentage(10));
    });

    it('Revert when paused', async () => {
      assert.isOk(await proxiedDxc.pause());
      assert.isTrue(await proxiedDxc.paused());
      try {
        await proxiedDxc.changeProtocolPercentage(5);
      } catch (error) {
        error.toString().includes('paused');
      }
      assert.isOk(await proxiedDxc.unpause());
      assert.isOk(await proxiedDxc.changeProtocolPercentage(12));
      assert.equal(
        await (await proxiedDxc.protocolPercentage()).toString(),
        '12'
      );
    });

    it('Only owner can pause', async () => {
      try {
        await proxiedDxc.pause({from: accounts[1]});
      } catch (error) {
        error.toString().includes('caller is not the owner');
      }
    });
  });
});
