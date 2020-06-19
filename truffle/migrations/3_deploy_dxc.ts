import fs from 'fs';

import {
  DTXTokenContract,
  DTXTokenInstance,
  DXCDealsContract,
  DXCDealsInstance,
  DXCTokensContract,
  DXCTokensInstance,
  OwnedUpgradeabilityProxyContract,
} from '../types/truffle-contracts';

const DTXMiniMe: DTXTokenContract = artifacts.require('DTXToken');
const DXCTokens: DXCTokensContract = artifacts.require('DXCTokens');
const DXCDeals: DXCDealsContract = artifacts.require('DXCDeals');
const ProxyDeals: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);
const ProxyTokens: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);

const performMigration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  const dTXTokenInstance: DTXTokenInstance = await DTXMiniMe.deployed();

  // We are going to deploy the DXC using a proxy pattern, allowing us to upgrade the DXC  contract later
  await deployer.deploy(DXCTokens);
  await deployer.deploy(DXCDeals);

  const dProxyDeals = await ProxyDeals.new();
  const dProxyTokens = await ProxyTokens.new();

  const dDxcTokens: DXCTokensInstance = await DXCTokens.deployed();
  const dDxcDeals: DXCDealsInstance = await DXCDeals.deployed();

  await dProxyTokens.upgradeTo(dDxcTokens.address);
  await dProxyDeals.upgradeTo(dDxcDeals.address);

  const tokenProxy = await DXCTokens.at(dProxyTokens.address);
  const dealsProxy = await DXCDeals.at(dProxyDeals.address);

  fs.writeFileSync(
    `./migration-reports/migration-${network}-${Date.now().toString()}.json`,
    JSON.stringify({
      Time: Date.now().toString(),
      Network: network,
      DtxToken: dTXTokenInstance.address,
      dxcdeals: dDxcDeals.address,
      dxctokens: dDxcTokens.address,
      dxctokenProxy: tokenProxy.address,
      dxcdealsProxy: dealsProxy.address,
    })
  );

  await dealsProxy.initialize(tokenProxy.address);
  await tokenProxy.initialize(dTXTokenInstance.address, dealsProxy.address);
};

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch((err: Error) => {
      console.log(err);
      process.exit(1);
    });
};
