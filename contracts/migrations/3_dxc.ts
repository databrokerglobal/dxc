import {
  DTXTokenContract,
  DXCContract,
} from '../types/truffle-contracts/index';

const DTXToken: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');

async function performMigration(
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) {
  const dDTX = await (network === 'mainnet'
    ? DTXToken.at('0x765f0c16d1ddc279295c1a7c24b0883f62d33f75')
    : DTXToken.deployed());
  await deployer.deploy(DXC, dDTX.address);
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
