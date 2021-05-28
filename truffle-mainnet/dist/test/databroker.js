"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ethers_1 = require("ethers");
const ethereum_waffle_1 = require("ethereum-waffle");
const IUniswap_json_1 = __importDefault(require("../build/IUniswap.json"));
const Databroker_json_1 = __importDefault(require("../build/Databroker.json"));
const USDT_json_1 = __importDefault(require("../build/USDT.json"));
const DTX_json_1 = __importDefault(require("../build/DTX.json"));
const { expectRevert } = require('@openzeppelin/test-helpers');
chai_1.use(ethereum_waffle_1.solidity);
describe('Databroker', () => {
    let databroker;
    let usdt;
    let dtx;
    let mockUniswap;
    let wallet;
    let testWallet;
    const dtxStakingAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
    const wyreWalletAddress = '0xa2Bd44b574035B347C48e426C50Bae6e6e392b3e';
    beforeEach(async () => {
        [wallet, testWallet] = new ethereum_waffle_1.MockProvider().getWallets();
        mockUniswap = await ethereum_waffle_1.deployMockContract(wallet, IUniswap_json_1.default.abi);
        usdt = await ethereum_waffle_1.deployContract(wallet, USDT_json_1.default, [
            ethers_1.utils.parseUnits('999999'),
        ]);
        dtx = await ethereum_waffle_1.deployContract(wallet, DTX_json_1.default, [
            wallet.address,
            ethers_1.utils.parseUnits('999999'),
        ]);
        databroker = await ethereum_waffle_1.deployContract(wallet, Databroker_json_1.default, [
            mockUniswap.address,
            usdt.address,
            dtx.address,
            wyreWalletAddress,
            dtxStakingAddress,
        ]);
    });
    it('should swap tokens for tokens', async () => {
        await mockUniswap.mock.swapExactTokensForTokens.returns([
            ethers_1.utils.parseUnits('999999'),
            ethers_1.utils.parseUnits('999999'),
        ]);
        await databroker.swapTokens(ethers_1.utils.parseUnits('1000'), ethers_1.utils.parseUnits('1000'), [usdt.address, dtx.address], databroker.address, ethers_1.utils.parseUnits('1622134835'));
        const allowance = await usdt.allowance(databroker.address, mockUniswap.address);
        expect(allowance.toString()).to.be.equal(ethers_1.utils.parseUnits('1000').toString());
        expect('approve').to.be.calledOnContractWith(usdt, [
            mockUniswap.address,
            ethers_1.utils.parseUnits('1000'),
        ]);
        expect('swapExactTokensForTokens').to.be.calledOnContractWith(mockUniswap, [
            ethers_1.utils.parseUnits('1000'),
            ethers_1.utils.parseUnits('1000'),
            [usdt.address, dtx.address],
            databroker.address,
            ethers_1.utils.parseUnits('1622134835'),
        ]);
    });
    it('should successfully complete payout', async () => {
        await mockUniswap.mock.swapExactTokensForTokens.returns([
            ethers_1.utils.parseUnits('999999'),
            ethers_1.utils.parseUnits('999999'),
        ]);
        await dtx.transfer(databroker.address, ethers_1.utils.parseUnits('10'), {
            from: wallet.address,
        });
        const beforeContractBalance = await dtx.balanceOf(databroker.address);
        expect(beforeContractBalance).to.be.equal(ethers_1.utils.parseUnits('10'));
        await databroker.payout(ethers_1.utils.parseUnits('1000'), ethers_1.utils.parseUnits('1000'), ethers_1.utils.parseUnits('10'), [dtx.address, usdt.address], ethers_1.utils.parseUnits('1622134835'));
        const allowance = await dtx.allowance(databroker.address, mockUniswap.address);
        expect(allowance.toString()).to.be.equal(ethers_1.utils.parseUnits('1000').toString());
        expect('approve').to.be.calledOnContractWith(dtx, [
            mockUniswap.address,
            ethers_1.utils.parseUnits('1000'),
        ]);
        expect('swapExactTokensForTokens').to.be.calledOnContractWith(mockUniswap, [
            ethers_1.utils.parseUnits('1000'),
            ethers_1.utils.parseUnits('1000'),
            [dtx.address, usdt.address],
            wyreWalletAddress,
            ethers_1.utils.parseUnits('1622134835'),
        ]);
        const afterContractBalance = await dtx.balanceOf(databroker.address);
        const stakingContractBalance = await dtx.balanceOf(dtxStakingAddress);
        expect(afterContractBalance).to.be.equal(ethers_1.utils.parseUnits('0'));
        expect(stakingContractBalance).to.be.equal(ethers_1.utils.parseUnits('10'));
    });
    it('payout should revert if contract has insufficient DTX balance', async () => {
        await expectRevert(databroker.payout(ethers_1.utils.parseUnits('1000'), ethers_1.utils.parseUnits('1000'), ethers_1.utils.parseUnits('10'), [dtx.address, usdt.address], ethers_1.utils.parseUnits('1622134835')), 'Databroker: Insufficient DTX balance of contract');
    });
    it('should update wyreWalletAddress and staking address', async () => {
        const newStakingAddress = '0xA515EE597Bfa4DCc90502aF6744A215bB0AD9EbC';
        const newWyreWalletAddress = '0x9e4e33eF13F67be8Fcfd94c61F0164123de2dF6F';
        await databroker.updateWyreWalletAddress(newWyreWalletAddress);
        await databroker.updateWyreWalletAddress(newStakingAddress);
    });
    it('should be able to withdraw the DTX and USDT linked to the databroker contract', async () => {
        await dtx.transfer(databroker.address, ethers_1.utils.parseUnits('10'), {
            from: wallet.address,
        });
        await usdt.transfer(databroker.address, ethers_1.utils.parseUnits('10'), {
            from: wallet.address,
        });
        await databroker.withdrawDTX(testWallet.address, ethers_1.utils.parseUnits('10'));
        await databroker.withdrawUSDT(testWallet.address, ethers_1.utils.parseUnits('10'));
        const testWalletDTX = await dtx.balanceOf(testWallet.address);
        const testWalletUSDT = await usdt.balanceOf(testWallet.address);
        expect(testWalletDTX).to.be.equal(ethers_1.utils.parseUnits('10'));
        expect(testWalletUSDT).to.be.equal(ethers_1.utils.parseUnits('10'));
    });
});
//# sourceMappingURL=databroker.js.map