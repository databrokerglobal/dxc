import {
  DTXTokenContract,
  DTXTokenInstance,
  DXCContract,
} from '../types/truffle-contracts';

const DTXMiniMe: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');

const performMigration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  const dTXTokenInstance: DTXTokenInstance = await DTXMiniMe.deployed();
  await deployer.deploy(DXC, dTXTokenInstance.address);
};
