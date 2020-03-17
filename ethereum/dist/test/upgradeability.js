"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encodeCall_1 = require("./encodeCall");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('Upgradeability of DXC', async (accounts) => {
    it('test case 1', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcInstance = await DXC.new();
        const oUPinstance = await OUP.new();
        const data = encodeCall_1.encodeCall('initialize', ['address'], [dtxInstance.address]);
        console.log(data);
        assert.isOk(await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
            from: accounts[0],
        }));
    });
});
//# sourceMappingURL=upgradeability.js.map