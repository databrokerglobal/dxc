import { StakingContract } from '../types/truffle-contracts';
const Staking: StakingContract = artifacts.require('./Staking.sol');

module.exports = async (deployer: Truffle.Deployer, network: string, accounts: string[]) =>
  deployer.deploy(Staking, '0x4B41FFfC23de50979aD3135F90720702Cc1b8da8', '10000000', '0x4B41FFfC23de50979aD3135F90720702Cc1b8da8'); 
  // TODO: need to pass the owner, supply, dtxToken value here for the Staking contract constructor
  // Vik's response: we can use the wallet I took to create the liquidity Pool on Uniswap?
  // What do you think should be our supply? same as DTX (225 millions)?
