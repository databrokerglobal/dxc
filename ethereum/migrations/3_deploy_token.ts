// Generated with typechain: typechain --target=truffle "./build/**/*.json"
import {
  OwnedUpgradeabilityProxyContract,
  TokenUpgradeContract,
} from '../types/truffle-contracts';
const TokenUpgrade: TokenUpgradeContract = artifacts.require(
  './TokenUpgrade.sol'
);
const OwnedUpgradeabilityProxy: OwnedUpgradeabilityProxyContract = artifacts.require(
  './OwnedUpgradeabilityProxy.sol'
);

async function performMigration (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) {
  // Is proxy deployed?
  const dOwnedUpgradeabilityProxy = await OwnedUpgradeabilityProxy.deployed();

  // deploy ogic contract here
  await deployer.deploy(TokenUpgrade);
  const dTokenUpgrade = await TokenUpgrade.deployed();

  // upgrade or initialize proxy with logic contract address
  await dOwnedUpgradeabilityProxy.upgradeTo(dTokenUpgrade.address);

  // re run constructor or init logic since proxy strorage is oblivious to it
  await dTokenUpgrade.initialize(accounts[0]);
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
