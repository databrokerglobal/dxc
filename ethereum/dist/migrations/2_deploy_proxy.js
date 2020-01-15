"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OwnedUpgradeabilityProxy = artifacts.require('./OwnedUpgradeabilityProxy.sol');
async function performMigration(deployer, network, accounts) {
    return deployer.deploy(OwnedUpgradeabilityProxy);
}
module.exports = (deployer, network, accounts) => {
    deployer
        .then(() => {
        return performMigration(deployer, network, accounts);
    })
        .catch((error) => {
        console.log(error);
        process.exit(1);
    });
};
//# sourceMappingURL=2_deploy_proxy.js.map