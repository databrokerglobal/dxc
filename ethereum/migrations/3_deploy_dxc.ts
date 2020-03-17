import {encodeCall} from '../test/utils/encodeCall';
import {
  DTXTokenContract,
  DTXTokenInstance,
  DXCContract,
  OwnedUpgradeabilityProxyContract,
} from '../types/truffle-contracts';

const DTXMiniMe: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');
const Proxy: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);

const performMigration = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  const dTXTokenInstance: DTXTokenInstance = await DTXMiniMe.deployed();

  await deployer.deploy(DXC);
  await deployer.deploy(Proxy);

  const dDxc = await DXC.deployed();
  const dProxy = await Proxy.deployed();

  const data = encodeCall(
    'initialize',
    ['address'],
    [dTXTokenInstance.address]
  );

  await dProxy.upgradeToAndCall(dDxc.address, data, {from: accounts[0]});
};

module.exports = (deployer: any, network: string, accounts: string[]) => {
  deployer
    .then(() => performMigration(deployer, network, accounts))
    .catch((err: Error) => {
      console.log(err);
      process.exit(1);
    });
};
