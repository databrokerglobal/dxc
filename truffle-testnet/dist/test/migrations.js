"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Migrations = artifacts.require("Migrations");
describe("Migrations", () => {
    let migrations;
    before(async function () {
        migrations = await Migrations.new();
    });
    it("Has an initial latest migration of 0", async () => {
        const lastCompletedMigration = await migrations.last_completed_migration();
        expect(lastCompletedMigration.toNumber()).to.be.equal(0);
    });
});
//# sourceMappingURL=migrations.js.map