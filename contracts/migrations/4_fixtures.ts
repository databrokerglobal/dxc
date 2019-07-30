import {
  DTXTokenContract,
  DXCContract,
} from '../types/truffle-contracts/index';

const DTXToken: DTXTokenContract = artifacts.require('DTXToken');
const DXC: DXCContract = artifacts.require('DXC');

async function performMigration(
  deployer: Truffle.Deployer,
  network: string,
  accounts: string[]
) {
  if (network !== 'mainnet') {
    const dDTXToken = await DTXToken.deployed();
    const dDXC = await DXC.deployed();
    await dDTXToken.generateTokens(dDXC.address, web3.utils.toWei('1000000'));
    await dDTXToken.generateTokens(accounts[0], web3.utils.toWei('1000000'));
    await dDTXToken.approve(dDXC.address, web3.utils.toWei('500000'));
    await dDXC.deposit(web3.utils.toWei('500000'));
    await dDXC.createDeal(
      'did:dxc:localhost:12345',
      '0x31523eb4bca1ebac3054b12d0306ac8ce5ce3f94',
      70,
      '0xdaf6a9f21d464dcf24fa29c5230507085217cab4',
      10,
      accounts[0],
      dDXC.address,
      15,
      web3.utils.toWei('1000'),
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 3600 * 24 * 30
    );
    await dDXC.createDeal(
      'did:dxc:localhost:12345',
      '0x31523eb4bca1ebac3054b12d0306ac8ce5ce3f94',
      70,
      '0xdaf6a9f21d464dcf24fa29c5230507085217cab4',
      10,
      accounts[0],
      dDXC.address,
      15,
      web3.utils.toWei('2000'),
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 3600 * 24 * 30
    );
    await dDXC.createDeal(
      'did:dxc:localhost:12346',
      '0x31523eb4bca1ebac3054b12d0306ac8ce5ce3f94',
      70,
      '0xdaf6a9f21d464dcf24fa29c5230507085217cab4',
      10,
      accounts[0],
      dDXC.address,
      15,
      web3.utils.toWei('4000'),
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 3600 * 24 * 30
    );
  }
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
