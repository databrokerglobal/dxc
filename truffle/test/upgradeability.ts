import {
  DTXTokenContract,
  DTXTokenInstance,
  DXCDealsContract,
  DXCDealsInstance,
  DXCTokensContract,
  DXCTokensInstance,
  DXCV2Contract,
  DXCV2Instance,
  MiniMeTokenFactoryContract,
  MiniMeTokenFactoryInstance,
  OwnedUpgradeabilityProxyContract,
  OwnedUpgradeabilityProxyInstance,
} from '../types/truffle-contracts';

import {encodeCall} from './utils/encodeCall';

const TF: MiniMeTokenFactoryContract = artifacts.require('MiniMeTokenFactory');
const DTX: DTXTokenContract = artifacts.require('DTXToken');
const DXCDeals: DXCDealsContract = artifacts.require('DXCDeals');
const DXCTokens: DXCTokensContract = artifacts.require('DXC');
const DXCV2: DXCV2Contract = artifacts.require('DXCV2');
const OUP: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);

contract('Upgradeability of DXC', async accounts => {
  it('Test proxied initializer', async () => {
    const tfInstance: MiniMeTokenFactoryInstance = await TF.new();
    const dtxInstance: DTXTokenInstance = await DTX.new(tfInstance.address);
    const dxcDealsInstance: DXCDealsInstance = await DXCDeals.new();
    const dxcTokensInstance: DXCTokensInstance = await DXCTokens.new();
    const oUPDealsinstance: OwnedUpgradeabilityProxyInstance = await OUP.new();
    const oUPTokensinstance: OwnedUpgradeabilityProxyInstance = await OUP.new();

    // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
    const data = encodeCall('initialize', ['address'], [dtxInstance.address]);

    // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
    assert.isOk(
      await oUPDealsinstance.upgradeToAndCall(dxcDealsInstance.address, data, {
        from: accounts[0],
      })
    );

    assert.isOk(
      await oUPTokensinstance.upgradeToAndCall(
        dxcTokensInstance.address,
        data,
        {
          from: accounts[0],
        }
      )
    );

    // Intitialize the proxied dxc instance
    const proxiedTokensDxc = await DXCTokens.at(oUPTokensinstance.address);
    // check if the intial state is correct
    const val2 = await proxiedTokensDxc.protocolPercentage();
    assert.equal(val2.toNumber(), 5);

    // check if changing the initial state works
    await proxiedTokensDxc.changeProtocolPercentage(10);
    const val3 = await proxiedTokensDxc.protocolPercentage();
    assert.equal(val3.toNumber(), 10);
  });

  it('Test upgradeabilty feature', async () => {
    const tfInstance: MiniMeTokenFactoryInstance = await TF.new();
    const dtxInstance: DTXTokenInstance = await DTX.new(tfInstance.address);
    const dxcTokensInstance: DXCTokensInstance = await DXCTokens.new();
    const oUPinstance: OwnedUpgradeabilityProxyInstance = await OUP.new();

    const data = encodeCall('initialize', ['address'], [dtxInstance.address]);

    assert.isOk(
      await oUPinstance.upgradeToAndCall(dxcTokensInstance.address, data, {
        from: accounts[0],
      })
    );

    const proxiedDxc = await DXCTokens.at(oUPinstance.address);
    const val2 = await proxiedDxc.protocolPercentage();
    assert.equal(val2.toNumber(), 5);

    await proxiedDxc.changeProtocolPercentage(10);
    const val3 = await proxiedDxc.protocolPercentage();
    assert.equal(val3.toNumber(), 10);

    // deploy new version of DXC with the newFeature method
    const newDxcInstance: DXCV2Instance = await DXCV2.new();
    assert.isOk(await oUPinstance.upgradeTo(newDxcInstance.address));

    // Check if state of previous dxcInstance is still maintained
    const proxiedUpgradedDxc = await DXCV2.at(oUPinstance.address);
    const val4 = await proxiedUpgradedDxc.protocolPercentage();
    assert.equal(val4.toNumber(), 10);

    // Check if newFeature method works
    const message = await proxiedUpgradedDxc.newFeature();
    assert.equal(message, 'Whoooaaaaa it works');
  });
});
