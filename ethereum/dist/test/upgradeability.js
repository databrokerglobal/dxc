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
        const newDxcInstance = await DXCV2.new();
    });
});
//# sourceMappingURL=upgradeability.js.map