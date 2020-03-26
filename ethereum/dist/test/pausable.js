"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encodeCall_1 = require("./utils/encodeCall");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('Pausable', accounts => {
    describe('Test pausable functionalities', () => {
        let proxiedDxc;
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
            proxiedDxc = await DXC.at(oUPinstance.address);
        });
        it('Initial state cannot be changed', async () => {
            try {
                await proxiedDxc.initPause();
            }
            catch (error) {
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
            }
            catch (error) {
                error.toString().includes('paused');
            }
            assert.isOk(await proxiedDxc.unpause());
            assert.isOk(await proxiedDxc.changeProtocolPercentage(12));
            assert.equal(await (await proxiedDxc.protocolPercentage()).toString(), '12');
        });
        it('Only owner can pause', async () => {
            try {
                await proxiedDxc.pause({ from: accounts[1] });
            }
            catch (error) {
                error.toString().includes('caller is not the owner');
            }
        });
    });
});
//# sourceMappingURL=pausable.js.map