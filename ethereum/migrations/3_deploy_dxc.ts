import {DXCContract} from '../types/truffle-contracts';

//const DTXMiniMe: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');

const performMigration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  //const dTXTokenInstance: DTXTokenInstance = await DTXMiniMe.deployed();
  await deployer.deploy(DXC);
};

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch((err: Error) => {
      console.log(err);
      process.exit(1);
    });
};
