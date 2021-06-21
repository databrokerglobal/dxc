import {use} from 'chai';
import {utils} from 'ethers';
import {
  deployContract,
  deployMockContract,
  MockProvider,
  solidity,
} from 'ethereum-waffle';

import IUniswap from '../build/IUniswap.json';
import Databroker from '../build/Databroker.json';
import USDT from '../build/USDT.json';
import DTX from '../build/DTX.json';

const {expectRevert} = require('@openzeppelin/test-helpers');

use(solidity);

describe('Databroker', () => {
  let databroker: any;
  let usdt: any;
  let dtx: any;
  let mockUniswap: any;
  let wallet: any;
  let testWallet: any;
  const dtxStakingAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
  const wyreWalletAddress = '0xa2Bd44b574035B347C48e426C50Bae6e6e392b3e';

  beforeEach(async () => {
    [wallet, testWallet] = new MockProvider().getWallets();
    mockUniswap = await deployMockContract(wallet, IUniswap.abi);

    usdt = await deployContract(wallet, USDT, [utils.parseUnits('999999')]);

    dtx = await deployContract(wallet, DTX, [utils.parseUnits('999999')]);

    databroker = await deployContract(wallet, Databroker, [
      mockUniswap.address,
      usdt.address,
      dtx.address,
      wyreWalletAddress,
      dtxStakingAddress,
    ]);
  });

  it('should swap tokens for tokens', async () => {
    await mockUniswap.mock.swapExactTokensForTokens.returns([
      utils.parseUnits('999999'),
      utils.parseUnits('999999'),
    ]);

    await databroker.swapTokens(
      utils.parseUnits('1000'),
      utils.parseUnits('1000'),
      [usdt.address, dtx.address],
      databroker.address,
      utils.parseUnits('1622134835')
    );

    const allowance = await usdt.allowance(
      databroker.address,
      mockUniswap.address
    );

    expect(allowance.toString()).to.be.equal(
      utils.parseUnits('1000').toString()
    );

    expect('approve').to.be.calledOnContractWith(usdt, [
      mockUniswap.address,
      utils.parseUnits('1000'),
    ]);

    expect('swapExactTokensForTokens').to.be.calledOnContractWith(mockUniswap, [
      utils.parseUnits('1000'),
      utils.parseUnits('1000'),
      [usdt.address, dtx.address],
      databroker.address,
      utils.parseUnits('1622134835'),
    ]);
  });

  it('should successfully complete payout', async () => {
    await mockUniswap.mock.swapExactTokensForTokens.returns([
      utils.parseUnits('999999'),
      utils.parseUnits('999999'),
    ]);

    await dtx.transfer(databroker.address, utils.parseUnits('10'), {
      from: wallet.address,
    });

    const beforeContractBalance = await dtx.balanceOf(databroker.address);

    expect(beforeContractBalance).to.be.equal(utils.parseUnits('10'));

    await databroker.payout(
      utils.parseUnits('1000'),
      utils.parseUnits('1000'),
      utils.parseUnits('10'),
      [dtx.address, usdt.address],
      utils.parseUnits('1622134835')
    );

    const allowance = await dtx.allowance(
      databroker.address,
      mockUniswap.address
    );

    expect(allowance.toString()).to.be.equal(
      utils.parseUnits('1000').toString()
    );

    expect('approve').to.be.calledOnContractWith(dtx, [
      mockUniswap.address,
      utils.parseUnits('1000'),
    ]);

    expect('swapExactTokensForTokens').to.be.calledOnContractWith(mockUniswap, [
      utils.parseUnits('1000'),
      utils.parseUnits('1000'),
      [dtx.address, usdt.address],
      wyreWalletAddress,
      utils.parseUnits('1622134835'),
    ]);

    const afterContractBalance = await dtx.balanceOf(databroker.address);
    const stakingContractBalance = await dtx.balanceOf(dtxStakingAddress);

    expect(afterContractBalance).to.be.equal(utils.parseUnits('0'));
    expect(stakingContractBalance).to.be.equal(utils.parseUnits('10'));
  });

  it('payout should revert if contract has insufficient DTX balance', async () => {
    await expectRevert(
      databroker.payout(
        utils.parseUnits('1000'),
        utils.parseUnits('1000'),
        utils.parseUnits('10'),
        [dtx.address, usdt.address],
        utils.parseUnits('1622134835')
      ),
      'Databroker: Insufficient DTX balance of contract'
    );
  });

  it('should update wyreWalletAddress and staking address', async () => {
    const newStakingAddress = '0xA515EE597Bfa4DCc90502aF6744A215bB0AD9EbC';
    const newWyreWalletAddress = '0x9e4e33eF13F67be8Fcfd94c61F0164123de2dF6F';

    await databroker.updateWyreWalletAddress(newWyreWalletAddress);
    await databroker.updateWyreWalletAddress(newStakingAddress);
  });

  it('should be able to withdraw the DTX and USDT linked to the databroker contract', async () => {
    await dtx.transfer(databroker.address, utils.parseUnits('10'), {
      from: wallet.address,
    });
    await usdt.transfer(databroker.address, utils.parseUnits('10'), {
      from: wallet.address,
    });

    await databroker.withdrawDTX(testWallet.address, utils.parseUnits('10'));
    await databroker.withdrawUSDT(testWallet.address, utils.parseUnits('10'));

    const testWalletDTX = await dtx.balanceOf(testWallet.address);
    const testWalletUSDT = await usdt.balanceOf(testWallet.address);

    expect(testWalletDTX).to.be.equal(utils.parseUnits('10'));
    expect(testWalletUSDT).to.be.equal(utils.parseUnits('10'));
  });
});
