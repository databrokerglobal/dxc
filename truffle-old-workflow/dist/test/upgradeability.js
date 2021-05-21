"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXCDeals = artifacts.require('DXCDeals');
const DXCTokens = artifacts.require('DXCTokens');
const DXCV2 = artifacts.require('DXCV2');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('Upgradeability of DXC', async (accounts) => {
    it('Test proxied initializer', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcDealsInstance = await DXCDeals.new();
        const dxcTokensInstance = await DXCTokens.new();
        const oUPDealsinstance = await OUP.new();
        const oUPTokensinstance = await OUP.new();
        let proxiedTokensDxc;
        let proxiedDealsDxc;
        assert.isOk(await oUPTokensinstance.upgradeTo(dxcTokensInstance.address, {
            from: accounts[0],
        }));
        assert.isOk(await oUPDealsinstance.upgradeTo(dxcDealsInstance.address, {
            from: accounts[0],
        }));
        proxiedTokensDxc = await DXCTokens.at(oUPTokensinstance.address);
        proxiedDealsDxc = await DXCDeals.at(oUPDealsinstance.address);
        await proxiedTokensDxc.initialize(dtxInstance.address, proxiedDealsDxc.address);
        await proxiedDealsDxc.initialize(proxiedTokensDxc.address);
        // check if the intial state is correct
        const val2 = await proxiedTokensDxc.protocolPercentage();
        assert.equal(val2.toNumber(), 5);
        // check if changing the initial state works
        await proxiedTokensDxc.changeProtocolPercentage(10);
        const val3 = await proxiedTokensDxc.protocolPercentage();
        assert.equal(val3.toNumber(), 10);
    });
    it('Test upgradeabilty feature', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcTokensInstance = await DXCTokens.new();
        const dxcDealsInstance = await DXCDeals.new();
        const oUPTokensinstance = await OUP.new();
        const oUPDealsinstance = await OUP.new();
        let proxiedTokensDxc;
        let proxiedDealsDxc;
        assert.isOk(await oUPTokensinstance.upgradeTo(dxcTokensInstance.address, {
            from: accounts[0],
        }));
        assert.isOk(await oUPDealsinstance.upgradeTo(dxcDealsInstance.address, {
            from: accounts[0],
        }));
        proxiedTokensDxc = await DXCTokens.at(oUPTokensinstance.address);
        proxiedDealsDxc = await DXCDeals.at(oUPDealsinstance.address);
        await proxiedTokensDxc.initialize(dtxInstance.address, proxiedDealsDxc.address);
        await proxiedDealsDxc.initialize(proxiedTokensDxc.address);
        const val2 = await proxiedTokensDxc.protocolPercentage();
        assert.equal(val2.toNumber(), 5);
        await proxiedTokensDxc.changeProtocolPercentage(10);
        const val3 = await proxiedTokensDxc.protocolPercentage();
        assert.equal(val3.toNumber(), 10);
        // deploy new version of DXC with the newFeature method
        const newDxcInstance = await DXCV2.new();
        assert.isOk(await oUPTokensinstance.upgradeTo(newDxcInstance.address));
        // Check if state of previous dxcInstance is still maintained
        const proxiedUpgradedDxc = await DXCV2.at(oUPTokensinstance.address);
        const val4 = await proxiedUpgradedDxc.protocolPercentage();
        assert.equal(val4.toNumber(), 10);
        // Check if newFeature method works
        const message = await proxiedUpgradedDxc.newFeature();
        assert.equal(message, 'Whoooaaaaa it works');
    });
});
//# sourceMappingURL=upgradeability.js.map