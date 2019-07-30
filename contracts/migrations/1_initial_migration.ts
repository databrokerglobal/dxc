/// <reference types="truffle-typings" />

import { MigrationsContract } from '../types/truffle-contracts/index';
const Migrations: MigrationsContract = artifacts.require('./Migrations.sol');

module.exports = async (
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) => {
  await deployer.deploy(Migrations);
};
