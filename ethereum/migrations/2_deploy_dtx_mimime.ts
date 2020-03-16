import {
  DTXTokenContract,
  MiniMeTokenFactoryContract,
  MiniMeTokenFactoryInstance,
} from '../types/truffle-contracts';

const DTXMiniMe: DTXTokenContract = artifacts.require('DTXToken');
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
  await tokenFactoryInstance.createCloneToken(
    '0x0',
    0,
    'DaTa eXchange Token',
    18,
    'DTX',
    true
  );
  await deployer.deploy(DTXMiniMe, tokenFactoryInstance.address);
};

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch((err: Error) => {
      console.log(err);
      process.exit(1);
    });
};
