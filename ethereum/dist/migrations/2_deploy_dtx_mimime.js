"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DTXMiniMe = artifacts.require('DTXToken');
const TokenFactory = artifacts.require('MiniMeTokenFactory');
const performMigration = async (deployer, network, accounts) => {
    await deployer.deploy(TokenFactory);
    const tokenFactoryInstance = await TokenFactory.deployed();
    await tokenFactoryInstance.createCloneToken('0x0', 0, 'DaTa eXchange Token', 18, 'DTX', true);
    await deployer.deploy(DTXMiniMe, tokenFactoryInstance.address);
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