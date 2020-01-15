"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migrations = artifacts.require('./Migrations.sol');
async function performMigration(deployer, network, accounts) {
    return deployer.deploy(Migrations);
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
//# sourceMappingURL=1_initial_migration.js.map