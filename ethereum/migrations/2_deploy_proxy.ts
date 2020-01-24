// Generated with typechain: typechain --target=truffle "./build/**/*.json"
import { OwnedUpgradeabilityProxyContract } from '../types/truffle-contracts';
const OwnedUpgradeabilityProxy: OwnedUpgradeabilityProxyContract = artifacts.require(
  './OwnedUpgradeabilityProxy.sol'
);

async function performMigration (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) {
  return deployer.deploy(OwnedUpgradeabilityProxy);
}

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => {
      return performMigration(deployer, network, accounts);
    })
    .catch((error: Error) => {
      console.log(error);
      process.exit(1);
    });
};
