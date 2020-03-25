"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encodeCall_1 = require("./utils/encodeCall");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('Pausable contract', accounts => {
    describe('Test pausable functionalities for dxc', () => {
        before('Init env', async () => {
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
            it('When not paused everything works as expected', async () => {
                assert.isOk(await proxiedDxc.protocolPercentage());
            });
        });
    });
});
//# sourceMappingURL=pausable.js.map