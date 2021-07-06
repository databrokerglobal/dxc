import {
  MigrationsContract,
  MigrationsInstance
} from "../types/truffle-contracts";

const Migrations: MigrationsContract = artifacts.require("Migrations");

describe("Migrations", () => {
  let migrations: MigrationsInstance;

  before(async function() {
    migrations = await Migrations.new();
  });

  it("Has an initial latest migration of 0", async () => {
    const lastCompletedMigration = await migrations.last_completed_migration();
    expect(lastCompletedMigration.toNumber()).to.be.equal(0);
  });
});
