"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DTXMiniMe = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const Proxy = artifacts.require('OwnedUpgradeabilityProxy');
const performMigration = async (deployer, network, accounts) => {
    const dTXTokenInstance = await DTXMiniMe.deployed();
    // We are going to deploy the DXC using a proxy pattern, allowing us to upgrade the DXC contract later
    await deployer.deploy(DXC);
    await deployer.deploy(Proxy);
    const dDxc = await DXC.deployed();
    await dDxc.initialize(dTXTokenInstance.address);
    // const dProxy = await Proxy.deployed();
    // // encode the calling of the initializer, which here acts as the constructor for the DXC contract
    // const data = encodeCall(
    //   'initialize',
    //   ['address'],
    //   [dTXTokenInstance.address]
    // );
    // // point proxy to DXC contract and call the constructor (aka the initializer)
    // await dProxy.upgradeToAndCall(dDxc.address, data, {from: accounts[0]});
};
module.exports = (deployer, network, accounts) => {
    deployer
        .then(() => performMigration(deployer, network, accounts))
        .catch((err) => {
        console.log(err);
        process.exit(1);
    });
};
//# sourceMappingURL=3_deploy_dxc.js.map