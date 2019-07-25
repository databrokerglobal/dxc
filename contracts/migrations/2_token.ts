import {
  DTXTokenContract,
  MiniMeTokenFactoryContract,
  MultiSigWalletWithDailyLimitContract,
} from '../types/truffle-contracts/index';

const MiniMeTokenFactory: MiniMeTokenFactoryContract = artifacts.require(
  'MiniMeTokenFactory'
);
const MultiSigWalletWithDailyLimit: MultiSigWalletWithDailyLimitContract = artifacts.require(
  'MultiSigWalletWithDailyLimit'
);
const DTXToken: DTXTokenContract = artifacts.require('DTXToken');

async function performMigration(
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) {
  if (network !== 'mainnet') {
    // Deploy the MiniMeTokenFactory, this is the factory contract that can create clones of the token
    await deployer.deploy(MiniMeTokenFactory);

    // Use or deploy the MultiSigWallet that will collect the ether
    await deployer.deploy(
      MultiSigWalletWithDailyLimit,
      [
        '0x52B8398551BB1d0BdC022355897508F658Ad42F8', // Roderik
        '0x16D0af500dbEA4F7c934ee97eD8EBF190d648de1', // Matthew
        '0x8A69583573b4F6a3Fd70b938DaFB0f61F3536692', // Jonathan
      ],
      2,
      web3.utils.toWei('100', 'ether')
    );
    const Wallet = await MultiSigWalletWithDailyLimit.deployed();

    // Deploy the actual DataBrokerDaoToken, the controller of the token is the one deploying. (Roderik)
    await deployer.deploy(DTXToken, MiniMeTokenFactory.address);
  }
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
