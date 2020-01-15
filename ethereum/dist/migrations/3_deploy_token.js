"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TokenUpgrade = artifacts.require('./TokenUpgrade.sol');
const OwnedUpgradeabilityProxy = artifacts.require('./OwnedUpgradeabilityProxy.sol');
async function performMigration(deployer, network, accounts) {
    // Is proxy deployed?
    const dOwnedUpgradeabilityProxy = await OwnedUpgradeabilityProxy.deployed();
    // deploy ogic contract here
    await deployer.deploy(TokenUpgrade);
    const dTokenUpgrade = await TokenUpgrade.deployed();
    // upgrade or initialize proxy with logic contract address
    await dOwnedUpgradeabilityProxy.upgradeTo(dTokenUpgrade.address);
    // re run constructor or init logic since proxy strorage is oblivious to it
    await dTokenUpgrade.initialize(accounts[0]);
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
//# sourceMappingURL=3_deploy_token.js.map