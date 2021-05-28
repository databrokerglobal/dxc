"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers");
const DXCDeals = artifacts.require("./DXCDeals");
contract("DXCDeals", async (accounts) => {
    let dxcDeals;
    const lockPeriod = 30;
    const platformPercentage = 10;
    describe("Deals", async () => {
        beforeEach(async () => {
            dxcDeals = await DXCDeals.new();
            assert.isOk(await dxcDeals.initialize(lockPeriod, platformPercentage));
        });
        it("It should revert if contract is re-initialized", async () => {
            await expectRevert(dxcDeals.initialize(lockPeriod, platformPercentage), "DXCDeals: Already initialized");
        });
        it("should create a new deal", async () => {
            const did = "001";
            const buyerId = "1";
            const sellerId = "2";
            const platformAddress = dxcDeals.address;
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            const deal = await dxcDeals.createDeal(did, buyerId, sellerId, platformAddress, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            expectEvent(deal, "DealCreated", { dealIndex, did });
        });
        it("should be able to decline the payout", async () => {
            const did = "001";
            const buyerId = "1";
            const sellerId = "2";
            const platformAddress = dxcDeals.address;
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal(did, buyerId, sellerId, platformAddress, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            await dxcDeals.declinePayout(dealIndex);
            const deal = await dxcDeals.getDealByIndex(dealIndex);
            expect(deal.accepted).to.be.equal(false);
        });
        it("should throw an error if deal index is not valid during declinePayout", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            await expectRevert(dxcDeals.declinePayout(10), "Invalid deal index");
        });
        it("should be able to complete the payout", async () => {
            const did = "001";
            const buyerId = "1";
            const sellerId = "2";
            const platformAddress = dxcDeals.address;
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal(did, buyerId, sellerId, platformAddress, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            await dxcDeals.completePayout(dealIndex);
            const deal = await dxcDeals.getDealByIndex(dealIndex);
            expect(deal.payoutCompleted).to.be.equal(true);
        });
        it("should throw an error if deal index is not valid during completePayout", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            await expectRevert(dxcDeals.completePayout(10), "Invalid deal index");
        });
        it("should revert calculateTransferAmount call if the deal was declined", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            await dxcDeals.declinePayout(dealIndex);
            await expectRevert(dxcDeals.calculateTransferAmount(dealIndex, new bn_js_1.default("55135393494483987")), "DXCDeals: Deal was declined by the buyer");
        });
        it("calculateTransferAmount - when swappedDTXEst > sellerShareInDTX", async () => {
            const amountInUSDT = new bn_js_1.default("1000000"); // 1 USDT
            const amountInDTX = new bn_js_1.default("49849900000000000"); // 0.0498499 DTX
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            const result = await dxcDeals.calculateTransferAmount(dealIndex, new bn_js_1.default("45135393494483987") // 0.045135393494483987 DTX
            );
            expect(result[0].toString()).to.be.equal("45135393494483987"); // 0.04513539349 DTX
            expect(result[1].toString()).to.be.equal("4714506505516013"); // 0.004714506506 DTX
        });
        it("calculateTransferAmount- when platformShareInDTX < extraDTXToBeAdded", async () => {
            const amountInUSDT = new bn_js_1.default("1000000"); // 1 USDT
            const amountInDTX = new bn_js_1.default("49849900000000000"); // 0.0498499 DTX
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            const result = await dxcDeals.calculateTransferAmount(dealIndex, new bn_js_1.default("50000000000000000") // 0.05 DTX
            );
            expect(result[0].toString()).to.be.equal("50000000000000000"); // 0.04513539349 DTX
            expect(result[1].toString()).to.be.equal("0"); // 0.004714506506 DTX
        });
        it("calculateTransferAmount - when swappedDTXEst < sellerShareInDTX", async () => {
            const amountInUSDT = new bn_js_1.default("1000000"); // 1 USDT
            const amountInDTX = new bn_js_1.default("49849900000000000"); // 0.0498499 DTX
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            const result = await dxcDeals.calculateTransferAmount(dealIndex, new bn_js_1.default("40000000000000000") // 0.04 DTX
            );
            expect(result[0].toString()).to.be.equal("40000000000000000"); // 0.04 DTX
            expect(result[1].toString()).to.be.equal("9849900000000000"); // 0.0098499 DTX
        });
        it("should be able to edit and get the platform percentage", async () => {
            await dxcDeals.editPlatformPercentage(new bn_js_1.default("20"));
            expect(await (await dxcDeals.getPlatformPercentage()).toString()).to.be.equal("20");
        });
        it("should be able to edit and get the lockPeriod", async () => {
            await dxcDeals.editLockPeriod(new bn_js_1.default("45"));
            expect(await (await dxcDeals.getLockPeriod()).toString()).to.be.equal("45");
        });
        it("should be able to get deal by index", async () => {
            const did = "001";
            const buyerId = "1";
            const sellerId = "2";
            const platformAddress = dxcDeals.address;
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal(did, buyerId, sellerId, platformAddress, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            const deal = await dxcDeals.getDealByIndex(dealIndex);
            expect(deal.did.toString()).to.be.equal("001");
            expect(deal.dealIndex.toString()).to.be.equal("1");
            expect(deal.platformAddress).to.be.equal(dxcDeals.address);
            expect(deal.amountInDTX.toString()).to.be.equal(amountInDTX.toString());
            expect(deal.amountInUSDT.toString()).to.be.equal(amountInUSDT.toString());
            expect(deal.accepted).to.be.equal(true);
            expect(deal.payoutCompleted).to.be.equal(false);
        });
        it("should be able to get all deals for did", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            await dxcDeals.createDeal("001", "3", "4", dxcDeals.address, amountInUSDT, amountInDTX);
            const result = await dxcDeals.getDealsForDID("001");
            expect(result.length).to.be.equal(2);
            expect(result[0].dealIndex).to.be.equal("1");
            expect(result[1].dealIndex).to.be.equal("2");
        });
        it("should revert createDeals if the msg.sender is not the owner", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await expectRevert(dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX, { from: accounts[1] }), "Ownable: caller is not the owner");
        });
        it("should revert declinePayout if the msg.sender is not the owner", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            await expectRevert(dxcDeals.declinePayout(dealIndex, { from: accounts[1] }), "Ownable: caller is not the owner");
        });
        it("should revert completePayout if the msg.sender is not the owner", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            await expectRevert(dxcDeals.completePayout(dealIndex, { from: accounts[1] }), "Ownable: caller is not the owner");
        });
        it("should revert calculateTransferAmount if the msg.sender is not the owner", async () => {
            const amountInUSDT = web3.utils.toWei(new bn_js_1.default(1000));
            const amountInDTX = web3.utils.toWei(new bn_js_1.default(50));
            await dxcDeals.createDeal("001", "1", "2", dxcDeals.address, amountInUSDT, amountInDTX);
            const dealIndex = await dxcDeals.getCurrentDealIndex();
            await expectRevert(dxcDeals.calculateTransferAmount(dealIndex, new bn_js_1.default("55135393494483987"), { from: accounts[1] }), "Ownable: caller is not the owner");
        });
        it("should revert editPlatformPercentage if the msg.sender is not the owner", async () => {
            await expectRevert(dxcDeals.editPlatformPercentage(20, {
                from: accounts[1]
            }), "Ownable: caller is not the owner");
        });
        it("should revert editLockPeriod if the msg.sender is not the owner", async () => {
            await expectRevert(dxcDeals.editLockPeriod(20, {
                from: accounts[1]
            }), "Ownable: caller is not the owner");
        });
    });
});
//# sourceMappingURL=dxcDeals.js.map