"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//const DTXMiniMe: DTXTokenContract = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const performMigration = async (deployer, network, accounts) => {
    //const dTXTokenInstance: DTXTokenInstance = await DTXMiniMe.deployed();
    await deployer.deploy(DXC);
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