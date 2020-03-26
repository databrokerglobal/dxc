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

  // We are going to deploy the DXC using a proxy pattern, allowing us to upgrade the DXC contract later
  await deployer.deploy(DXC);
  await deployer.deploy(Proxy);

  const dDxc = await DXC.deployed();
  const dProxy = await Proxy.deployed();

  // encode the calling of the initializer, which here acts as the constructor for the DXC contract
  const data = encodeCall(
    'initialize',
    ['address'],
    [dTXTokenInstance.address]
  );

  // point proxy to DXC contract and call the constructor (aka the initializer)
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
