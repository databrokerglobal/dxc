// import Web3 from 'web3';

import {
  MigrationsContract,
  MigrationsInstance,
} from '../types/truffle-contracts';

// const w3: Web3 = web3;
const Migrations: MigrationsContract = artifacts.require('Migrations');

describe('Migrations', () => {
  // let accounts: string[];
  let migrations: MigrationsInstance;

  before(async function() {
    // accounts = await w3.eth.getAccounts();
    migrations = await Migrations.new();
  });

  it('Has an initial latest migration of 0', async () => {
    const lastCompletedMigration = await migrations.lastCompletedMigration();
    expect(lastCompletedMigration.toNumber()).to.be.equal(0);
  });
});
