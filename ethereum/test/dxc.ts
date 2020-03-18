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

contract('DXC functionailities', async accounts => {
  it('Should depoy succesfully using proxy pattern', async () => {
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
    const proxiedDxc = await DXC.at(oUPinstance.address);
    // check if the intial state is correct
    const val2 = await proxiedDxc.protocolPercentage();
    assert.equal(val2.toNumber(), 5);
  });

  it('Should create a deal successfully', async () => {
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
    const proxiedDxc = await DXC.at(oUPinstance.address);

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
    const proxiedDxc = await DXC.at(oUPinstance.address);

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
