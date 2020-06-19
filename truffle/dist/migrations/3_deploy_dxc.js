"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const DTXMiniMe = artifacts.require('DTXToken');
const DXCTokens = artifacts.require('DXCTokens');
const DXCDeals = artifacts.require('DXCDeals');
const ProxyDeals = artifacts.require('OwnedUpgradeabilityProxy');
const ProxyTokens = artifacts.require('OwnedUpgradeabilityProxy');
const performMigration = async (deployer, network, accounts) => {
    const dTXTokenInstance = await DTXMiniMe.deployed();
    // We are going to deploy the DXC using a proxy pattern, allowing us to upgrade the DXC  contract later
    await deployer.deploy(DXCTokens);
    await deployer.deploy(DXCDeals);
    const dProxyDeals = await ProxyDeals.new();
    const dProxyTokens = await ProxyTokens.new();
    const dDxcTokens = await DXCTokens.deployed();
    const dDxcDeals = await DXCDeals.deployed();
    await dProxyTokens.upgradeTo(dDxcTokens.address);
    await dProxyDeals.upgradeTo(dDxcDeals.address);
    const tokenProxy = await DXCTokens.at(dProxyTokens.address);
    const dealsProxy = await DXCDeals.at(dProxyDeals.address);
    fs_1.default.writeFileSync(`./migration-reports/migration-${network}-${Date.now().toString()}.json`, JSON.stringify({
        Time: Date.now().toString(),
        Network: network,
        DtxToken: dTXTokenInstance.address,
        dxcdeals: dDxcDeals.address,
        dxctokens: dDxcTokens.address,
        dxctokenProxy: tokenProxy.address,
        dxcdealsProxy: dealsProxy.address,
    }));
    await dealsProxy.initialize(tokenProxy.address);
    await tokenProxy.initialize(dTXTokenInstance.address, dealsProxy.address);
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