import {
  DTXTokenContract,
  MiniMeTokenFactoryContract,
  MiniMeTokenFactoryInstance,
} from '../types/truffle-contracts';

const DTXToken: DTXTokenContract = artifacts.require('DTXToken');
const TokenFactory: MiniMeTokenFactoryContract = artifacts.require(
  'MiniMeTokenFactory'
);

const performMigration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  await deployer.deploy(TokenFactory);
  const tokenFactoryInstance: MiniMeTokenFactoryInstance = await TokenFactory.deployed();
  await deployer.deploy(DTXToken, tokenFactoryInstance.address);
};

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch((err: Error) => {
      console.log(err);
      process.exit(1);
    });
};
