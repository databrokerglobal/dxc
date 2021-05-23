"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { deployProxy } = require('@openzeppelin/truffle-upgrades');
const DXCDeals = artifacts.require('./DXCDeals.sol');
module.exports = async function (deployer) {
    const lockPeriod = 30;
    const platformPercentage = 10;
    const instance = await deployProxy(DXCDeals, [lockPeriod, platformPercentage], { deployer, initializer: 'initialize' });
    console.log('Deployed', instance.address);
};
//# sourceMappingURL=2_dxc_deals.js.map