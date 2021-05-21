import {
    DTXStakingContract,
  } from '../types/truffle-contracts';
  

const Staking = artifacts.require("Staking");

const performMigration = async (
    deployer: Truffle.Deployer,
    network: string,
    accounts: string[]
  ) => {
    await deployer.deploy(Staking);
  };

  
module.exports = (deployer: any, network: string, accounts: string[]) => {
    deployer
      .then(() => performMigration(deployer, network, accounts))
      .catch((err: Error) => {
        console.log(err);
        process.exit(1);
      });
  };