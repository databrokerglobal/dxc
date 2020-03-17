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

import {encodeCall} from './encodeCall';

const TF: MiniMeTokenFactoryContract = artifacts.require('MiniMeTokenFactory');
const DTX: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');
const OUP: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);

contract('Upgradeability of DXC', async accounts => {
  it('Test proxied initializer', async () => {
    const tfInstance: MiniMeTokenFactoryInstance = await TF.new();
    const dtxInstance: DTXTokenInstance = await DTX.new(tfInstance.address);
    const dxcInstance: DXCInstance = await DXC.new();
    const oUPinstance: OwnedUpgradeabilityProxyInstance = await OUP.new();

    const data = encodeCall('initialize', ['address'], [dtxInstance.address]);

    assert.isOk(
      await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
        from: accounts[0],
      })
    );

    const proxiedDxc = await DXC.at(oUPinstance.address);
    const val2 = await proxiedDxc.protocolPercentage();
    assert.equal(val2.toNumber(), 5);

    await proxiedDxc.changeProtocolPercentage(10);
    const val3 = await proxiedDxc.protocolPercentage();
    assert.equal(val3.toNumber(), 10);
  });
});
