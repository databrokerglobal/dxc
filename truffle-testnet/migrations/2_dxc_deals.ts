const {deployProxy} = require("@openzeppelin/truffle-upgrades");
import {DXCDealsContract} from "../types/truffle-contracts";
const DXCDeals: DXCDealsContract = artifacts.require("./DXCDeals.sol");

module.exports = async function(deployer: any) {
  const lockPeriod = 30;
  const platformPercentage = 10;
  const instance = await deployProxy(
    DXCDeals,
    [lockPeriod, platformPercentage],
    {deployer, initializer: "initialize"}
  );
  console.log("Deployed", instance.address);
};
