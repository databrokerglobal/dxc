"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DTXMiniMe = artifacts.require('DTXToken');
const DXCTokens = artifacts.require('DXCTokens');
const DXCDeals = artifacts.require('DXCDeals');
const ProxyDeals = artifacts.require('OwnedUpgradeabilityProxy');
const ProxyTokens = artifacts.require('OwnedUpgradeabilityProxy');
const performMigration = async (deployer, network, accounts) => {
    const dTXTokenInstance = await DTXMiniMe.deployed();
    // We are going to deploy the DXC using a proxy pattern, allowing us to upgrade the DXC contract later
    await deployer.deploy(DXCTokens);
    await deployer.deploy(DXCDeals);
    await deployer.deploy(ProxyDeals);
    await deployer.deploy(ProxyTokens);
    const dDxcTokens = await DXCTokens.deployed();
    const dDxcDeals = await DXCDeals.deployed();
    const dProxyTokens = await ProxyTokens.deployed();
    const dProxyDeals = await ProxyDeals.deployed();
    await dProxyTokens.upgradeTo(dDxcTokens.address);
    await dProxyTokens.initialize(dTXTokenInstance.address, dProxyDeals.address);
    await dProxyDeals.upgradeTo(dDxcDeals.address);
    await dProxyDeals.initialize(dProxyTokens.address);
};
module.exports = (deployer, network, accounts) => {
    deployer
        .then(() => performMigration(deployer, network, accounts))
        .catch((err) => {
        console.log(err);
        process.exit(1);
    });
};
//# sourceMappingURL=3_deploy_dxc.js.map