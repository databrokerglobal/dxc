"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Staking = artifacts.require('./Staking.sol');
module.exports = async (deployer, network, accounts) => deployer.deploy(Staking, '0x4B41FFfC23de50979aD3135F90720702Cc1b8da8', '10000000', '0x4B41FFfC23de50979aD3135F90720702Cc1b8da8'); // TODO: need to pass the owner, supply, dtxToken value here for the Staking contract constructor
//# sourceMappingURL=2_staking_migrations.js.map