// Generated with typechain: typechain --target=truffle "./build/**/*.json"
import {
  OwnedUpgradeabilityProxyContract,
  TokenContract,
} from '../types/truffle-contracts';
import { encodeCall } from './utils/encodeCall';

const Token: TokenContract = artifacts.require('./Token.sol');
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

  // deploy logic contract here
  await deployer.deploy(Token);
  const dToken = await Token.deployed();

  // re run constructor or init logic since proxy strorage is oblivious to it
  // encode the function call needed (function name, contract address, function param(s))
  const initializeData = encodeCall(
    'initialize',
    [`address`],
    [`${accounts[0]}`]
  );

  // Initialize data in function call
  await dOwnedUpgradeabilityProxy.upgradeToAndCall(
    dToken.address,
    initializeData,
    { from: accounts[0] }
  );

  /*
    Now that a proxy is set interact with the target contract as follows:

    const logicContractFromProxy = await logicContract.at(addressOfProxyContract)
    await logicContract.method();

    Upgrading:

    deployer.deploy(newContract) // new contract must extend previous one

    await OwnedUpgradeabilityProxy.upgradeTo(newAddress)

  */
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
