"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const {deployProxy} = require('@openzeppelin/truffle-upgrades');
const Databroker = artifacts.require('./Databroker.sol');
const Staking = artifacts.require('./Staking.sol');
module.exports = async function (deployer) {
    const uniswapRouter = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const usdtTokenAddress = '0x0D9C8723B343A8368BebE0B5E89273fF8D712e3C'; // TODO: Update
    const dtxTokenAddress = '0xFB0F196202a37D3126Abab5c8D4Db0f1bd633d33'; // TODO: Update
    const wyreWalletAddress = '0xFB0F196202a37D3126Abab5c8D4Db0f1bd633d33'; // TODO: Update
    await deployer.deploy(Staking, '0x4B41FFfC23de50979aD3135F90720702Cc1b8da8', // TODO: Update
    '10000000', // // TODO: Update
    '0x4B41FFfC23de50979aD3135F90720702Cc1b8da8' // // TODO: Update
    );
    const dtxStakingInstance = await Staking.deployed();
    await deployer.deploy(Databroker, uniswapRouter, usdtTokenAddress, dtxTokenAddress, wyreWalletAddress, dtxStakingInstance.address);
};
//# sourceMappingURL=2_databroker_migration.js.map