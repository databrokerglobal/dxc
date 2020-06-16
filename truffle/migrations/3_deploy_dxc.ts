//import {encodeCall} from '../test/utils/encodeCall';
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

  // We are going to deploy the DXC using a proxy pattern, allowing us to upgrade the DXC contract later
  await deployer.deploy(DXCTokens);
  await deployer.deploy(DXCDeals);
  await deployer.deploy(ProxyDeals);
  await deployer.deploy(ProxyTokens);

  const dDxcTokens: DXCTokensInstance = await DXCTokens.deployed();
  const dDxcDeals: DXCDealsInstance = await DXCDeals.deployed();

  const dProxyTokens = await ProxyTokens.deployed();
  const dProxyDeals = await ProxyDeals.deployed();

  await dProxyTokens.upgradeTo(dDxcTokens.address);
  await ((dProxyTokens as any) as DXCTokensInstance).initialize(
    dTXTokenInstance.address,
    dProxyDeals.address
  );

  await dProxyDeals.upgradeTo(dDxcDeals.address);
  await ((dProxyDeals as any) as DXCDealsInstance).initialize(
    dProxyTokens.address
  );
};

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch((err: Error) => {
      console.log(err);
      process.exit(1);
    });
};
