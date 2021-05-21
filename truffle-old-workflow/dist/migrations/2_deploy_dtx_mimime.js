"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DTXToken = artifacts.require('DTXToken');
const TokenFactory = artifacts.require('MiniMeTokenFactory');
const performMigration = async (deployer, network, accounts) => {
    await deployer.deploy(TokenFactory);
    const tokenFactoryInstance = await TokenFactory.deployed();
    await deployer.deploy(DTXToken, tokenFactoryInstance.address);
};
module.exports = (deployer, network, accounts) => {
    deployer
        .then(() => performMigration(deployer, network, accounts))
        .catch((err) => {
        console.log(err);
        process.exit(1);
    });
};
//# sourceMappingURL=2_deploy_dtx_mimime.js.map