// Generated with typechain: typechain --target=truffle "./build/**/*.json"
import { MigrationsContract } from '../types/truffle-contracts';
const Migrations: MigrationsContract = artifacts.require('./Migrations.sol');

async function performMigration(
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) {
  return deployer.deploy(Migrations);
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
