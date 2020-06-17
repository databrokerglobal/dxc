"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXCTokens = artifacts.require('DXCTokens');
const DXCDeals = artifacts.require('DXCDeals');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('Pausable', accounts => {
    describe('Test pausable functionalities', () => {
        let proxiedTokensDxc;
        let proxiedDealsDxc;
        before('Init env', async () => {
            const tfInstance = await TF.new();
            const dtxInstance = await DTX.new(tfInstance.address);
            const dxcTokensInstance = await DXCTokens.new();
            const dxcDealsInstance = await DXCDeals.new();
            const oUPDealsinstance = await OUP.new();
            const oUPTokensinstance = await OUP.new();
            // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
            assert.isOk(await oUPTokensinstance.upgradeTo(dxcTokensInstance.address, {
                from: accounts[0],
            }));
            assert.isOk(await oUPDealsinstance.upgradeTo(dxcDealsInstance.address, {
                from: accounts[0],
            }));
            // Intitialize the proxied dxc instance
            proxiedTokensDxc = await DXCTokens.at(oUPTokensinstance.address);
            proxiedDealsDxc = await DXCDeals.at(oUPDealsinstance.address);
            await proxiedTokensDxc.initialize(dtxInstance.address, proxiedDealsDxc.address);
            await proxiedDealsDxc.initialize(proxiedTokensDxc.address);
        });
        it('Initial state cannot be changed', async () => {
            try {
                await proxiedTokensDxc.initPause();
            }
            catch (error) {
                error.toString().includes('Transaction reverted');
            }
        });
        it('When not paused everything works as expected', async () => {
            assert.isFalse(await proxiedTokensDxc.paused());
            assert.isOk(await proxiedTokensDxc.changeProtocolPercentage(10));
        });
        it('Revert when paused', async () => {
            assert.isOk(await proxiedTokensDxc.pause());
            assert.isTrue(await proxiedTokensDxc.paused());
            try {
                await proxiedTokensDxc.changeProtocolPercentage(5);
            }
            catch (error) {
                error.toString().includes('paused');
            }
            assert.isOk(await proxiedTokensDxc.unpause());
            assert.isOk(await proxiedTokensDxc.changeProtocolPercentage(12));
            assert.equal(await (await proxiedTokensDxc.protocolPercentage()).toString(), '12');
        });
        it('Only owner can pause', async () => {
            try {
                await proxiedTokensDxc.pause({ from: accounts[1] });
            }
            catch (error) {
                error.toString().includes('caller is not the owner');
            }
        });
    });
});
//# sourceMappingURL=pausable.js.map