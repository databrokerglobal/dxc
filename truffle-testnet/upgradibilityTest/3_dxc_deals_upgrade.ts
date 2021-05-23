const { upgradeProxy } = require('@openzeppelin/truffle-upgrades');
import { DXCDealsContract } from '../types/truffle-contracts';
const DXCDeals: DXCDealsContract = artifacts.require('./DXCDeals.sol');
const DXCDealsV2: DXCDealsContract = artifacts.require('./DXCDealsV2.sol');

module.exports = async function (deployer: any) {
  const deals = await DXCDeals.deployed();
  console.log('Old DXCDeals', deals.address);
  const instance = await upgradeProxy(deals.address, DXCDealsV2, { deployer });
  console.log("Upgraded", instance.address);
};
