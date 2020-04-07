"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encodeCall_1 = require("./utils/encodeCall");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const DXCV2 = artifacts.require('DXCV2');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('Upgradeability of DXC', async (accounts) => {
    it('Test proxied initializer', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcInstance = await DXC.new();
        const oUPinstance = await OUP.new();
        // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
        const data = encodeCall_1.encodeCall('initialize', ['address'], [dtxInstance.address]);
        // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
        assert.isOk(await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
            from: accounts[0],
        }));
        // Intitialize the proxied dxc instance
        const proxiedDxc = await DXC.at(oUPinstance.address);
        // check if the intial state is correct
        const val2 = await proxiedDxc.protocolPercentage();
        assert.equal(val2.toNumber(), 5);
        // check if changing the initial state works
        await proxiedDxc.changeProtocolPercentage(10);
        const val3 = await proxiedDxc.protocolPercentage();
        assert.equal(val3.toNumber(), 10);
    });
    it('Test upgradeabilty feature', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcInstance = await DXC.new();
        const oUPinstance = await OUP.new();
        const data = encodeCall_1.encodeCall('initialize', ['address'], [dtxInstance.address]);
        assert.isOk(await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
            from: accounts[0],
        }));
        const proxiedDxc = await DXC.at(oUPinstance.address);
        const val2 = await proxiedDxc.protocolPercentage();
        assert.equal(val2.toNumber(), 5);
        await proxiedDxc.changeProtocolPercentage(10);
        const val3 = await proxiedDxc.protocolPercentage();
        assert.equal(val3.toNumber(), 10);
        // deploy new version of DXC with the newFeature method
        const newDxcInstance = await DXCV2.new();
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
//# sourceMappingURL=upgradeability.js.map