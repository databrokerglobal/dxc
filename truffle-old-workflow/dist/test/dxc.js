"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const getLatestQuote_1 = require("./utils/getLatestQuote");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXCDeals = artifacts.require('DXCDeals');
const DXCTokens = artifacts.require('DXCTokens');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('DXC', async (accounts) => {
    describe('DXC functionalities', async () => {
        let tfInstance;
        let dtxInstance;
        let dxcDealsInstance;
        let dxcTokensInstance;
        let oUPTokensinstance;
        let oUPDealsinstance;
        let proxiedDxcDeals;
        let proxiedDxcTokens;
        let latestQuote;
        function amountOfDTXFor(amountInUSD) {
            return new bn_js_1.default(amountInUSD / latestQuote);
        }
        before(async () => {
            latestQuote = await getLatestQuote_1.getLatestQuote();
            tfInstance = await TF.new();
            dtxInstance = await DTX.new(tfInstance.address);
            dxcTokensInstance = await DXCTokens.new();
            dxcDealsInstance = await DXCDeals.new();
            oUPTokensinstance = await OUP.new();
            oUPDealsinstance = await OUP.new();
            assert.isOk(await oUPDealsinstance.upgradeTo(dxcDealsInstance.address, {
                from: accounts[0],
            }));
            // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
            assert.isOk(await oUPTokensinstance.upgradeTo(dxcTokensInstance.address, {
                from: accounts[0],
            }));
            // initialize the proxied dxc instance
            proxiedDxcTokens = await DXCTokens.at(oUPTokensinstance.address);
            proxiedDxcDeals = await DXCDeals.at(oUPDealsinstance.address);
            assert.isOk(await proxiedDxcTokens.initialize(dtxInstance.address, proxiedDxcDeals.address));
            assert.isOk(await proxiedDxcDeals.initialize(proxiedDxcTokens.address));
            await dtxInstance.generateTokens(proxiedDxcTokens.address, web3.utils.toWei('1000000'));
            await dtxInstance.generateTokens(accounts[0], web3.utils.toWei('1000000'));
            await dtxInstance.generateTokens(accounts[1], web3.utils.toWei('1000000'));
            await proxiedDxcTokens.platformDeposit(web3.utils.toWei('1000000'));
        });
        it('Should have a platform balance', async () => {
            expect(await (await proxiedDxcTokens.platformBalance()).toString()).to.be.equal(web3.utils.toWei('1000000'));
        });
        it('Can read the balance of someone internally', async () => {
            const balanceResult = await proxiedDxcTokens.balanceOf(accounts[0]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
        });
        it('Can convert from fiat money', async () => {
            let balanceResult = await proxiedDxcTokens.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
            await proxiedDxcTokens.convertFiatToToken(accounts[1], web3.utils.toWei(amountOfDTXFor(1)));
            balanceResult = await proxiedDxcTokens.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(1).toString()));
        });
        it('Cannot convert from fiat money if the user is not the owner', async () => {
            let balanceResult = await proxiedDxcTokens.balanceOf(accounts[2]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            try {
                await proxiedDxcTokens.convertFiatToToken(accounts[2], web3.utils.toWei(amountOfDTXFor(100)), { from: accounts[9] });
                assert(false, 'Test succeeded when it should have failed');
            }
            catch (error) {
                assert.isTrue(error.toString().includes('caller is not the owner'));
            }
            balanceResult = await proxiedDxcTokens.balanceOf(accounts[2]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Can deposit DTX tokens', async () => {
            await dtxInstance.generateTokens(accounts[3], web3.utils.toWei('1000000'));
            let balanceResult = await proxiedDxcTokens.balanceOf(accounts[3]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            await dtxInstance.approve(proxiedDxcTokens.address, web3.utils.toWei(amountOfDTXFor(100)), { from: accounts[3] });
            const allowanceResult = await dtxInstance.allowance(accounts[3], proxiedDxcTokens.address);
            expect(allowanceResult.toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(100).toString()));
            await proxiedDxcTokens.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
                from: accounts[3],
            });
            balanceResult = await proxiedDxcTokens.balanceOf(accounts[3]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(100).toString()));
        });
        it('Cannot deposit DTX tokens if the allowance is too little', async () => {
            await dtxInstance.generateTokens(accounts[4], web3.utils.toWei(amountOfDTXFor(100)));
            let balanceResult = await proxiedDxcTokens.balanceOf(accounts[4]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            await dtxInstance.approve(proxiedDxcTokens.address, new bn_js_1.default('5'), {
                from: accounts[4],
            });
            const allowanceResult = await dtxInstance.allowance(accounts[4], proxiedDxcTokens.address);
            expect(allowanceResult.toString()).to.be.equal(new bn_js_1.default('5').toString());
            try {
                await proxiedDxcTokens.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
                    from: accounts[4],
                });
            }
            catch (error) {
                assert.isTrue(error.toString().includes('too little allowance'));
            }
            balanceResult = await proxiedDxcTokens.balanceOf(accounts[4]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Cannot deposit DTX tokens if there is not enough DTX available', async () => {
            let balanceResult = await proxiedDxcTokens.balanceOf(accounts[5]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            await dtxInstance.approve(proxiedDxcTokens.address, web3.utils.toWei(amountOfDTXFor(100)), { from: accounts[5] });
            const allowanceResult = await dtxInstance.allowance(accounts[5], proxiedDxcTokens.address);
            expect(allowanceResult.toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(100).toString()));
            try {
                await proxiedDxcTokens.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
                    from: accounts[5],
                });
            }
            catch (error) {
                assert.isTrue(error.toString().includes('too little DTX'));
            }
            balanceResult = await proxiedDxcTokens.balanceOf(accounts[5]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Can withdraw DTX tokens', async () => {
            const balanceResult1 = await proxiedDxcTokens.balanceOf(accounts[1]);
            assert.isTrue(balanceResult1[0].toString() !== '0');
            await proxiedDxcTokens.withdraw({
                from: accounts[1],
            });
            const balanceResult = await proxiedDxcTokens.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Should create a deal successfully', async () => {
            // All percentages here need to add up to a 100: 15 + 70 + 10 = 95 + protocol percentage 5 = 100
            await proxiedDxcDeals.createDeal('did:databroker:deal2:weatherdata', accounts[1], 15, accounts[2], 70, accounts[3], accounts[4], 10, 5, 0, 0);
        });
        it('Can create a new deal only when the percentages add up to 100', async () => {
            // Case where 90 + 5 == 95
            try {
                await proxiedDxcDeals.createDeal('did:dxc:12345', accounts[1], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[3], accounts[0], new bn_js_1.default('10'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            }
            catch (error) {
                assert.isTrue(error
                    .toString()
                    .includes('All percentages need to add up to exactly 100'));
            }
            // case where 100 + 5 == 105
            try {
                await proxiedDxcDeals.createDeal('did:dxc:12345', accounts[1], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[3], accounts[0], new bn_js_1.default('20'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            }
            catch (error) {
                assert.isTrue(error
                    .toString()
                    .includes('All percentages need to add up to exactly 100'));
            }
            // Good case where 95 + 5 == 100
            await proxiedDxcDeals.createDeal('did:dxc:12345', accounts[1], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[3], accounts[0], new bn_js_1.default('15'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
        });
        it('Can list all deals', async () => {
            await proxiedDxcDeals.createDeal('did:dxc:12345', accounts[3], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[1], accounts[0], new bn_js_1.default('15'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            const deals = await proxiedDxcDeals.allDeals();
            expect(deals.length).to.be.equal(3);
        });
        it('Can get the info for a deal', async () => {
            await proxiedDxcDeals.createDeal('did:dxc:12345', accounts[3], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[1], accounts[0], new bn_js_1.default('15'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            const deal = await proxiedDxcDeals.getDealByIndex(2);
            expect(deal.did).to.be.equal('did:dxc:12345');
        });
        it('Can get all the deals for a did', async () => {
            const deals = await proxiedDxcDeals.dealsForDID('did:dxc:12345');
            expect(deals).to.be.length(3);
        });
        it('Can signal access to a did whithout blacklist/whitelist', async () => {
            let access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[6]);
            expect(access).to.be.equal(false);
        });
        it('Can signal access to a deal with blacklist/whitelist 1', async () => {
            let access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // Add user to blacklist
            await proxiedDxcDeals.addPermissionsToDeal([accounts[1]], [], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxcDeals.addPermissionsToDeal([], [], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal with blacklist/whitelist 2', async () => {
            let access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist without the user in it
            await proxiedDxcDeals.addPermissionsToDeal([], [accounts[7]], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxcDeals.addPermissionsToDeal([], [], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal whith blacklist/whitelist 3', async () => {
            let access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist with the user in it
            await proxiedDxcDeals.addPermissionsToDeal([], [accounts[1]], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            await proxiedDxcDeals.addPermissionsToDeal([], [], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal whith blacklist/whitelist 4', async () => {
            let access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist with the user in it and is in blacklist
            await proxiedDxcDeals.addPermissionsToDeal([accounts[2]], [accounts[2]], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxcDeals.addPermissionsToDeal([], [], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal whith blacklist/whitelist 5', async () => {
            let access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist without the user in it and is in blacklist
            await proxiedDxcDeals.addPermissionsToDeal([accounts[2]], [accounts[7]], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxcDeals.addPermissionsToDeal([], [], 2);
            access = await proxiedDxcDeals.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        // first remove the require statement on the dxc token contract (transferEx method and releaseEscrow) for this to work
        // it('Releasing escrow should be correct', async () => {
        //   await proxiedDxcTokens.convertFiatToToken(
        //     accounts[1],
        //     web3.utils.toWei(amountOfDTXFor(500))
        //   );
        //   const stuffbeforeDeal = await proxiedDxcTokens.balanceOf(accounts[1]);
        //   await proxiedDxcDeals.createDeal(
        //     'did:dxc:12345',
        //     accounts[3],
        //     new BN('70'),
        //     accounts[2],
        //     new BN('10'),
        //     accounts[1],
        //     accounts[0],
        //     new BN('15'),
        //     web3.utils.toWei(amountOfDTXFor(50)),
        //     Math.floor(Date.now() / 1000),
        //     Math.floor(Date.now() / 1000) + 3600 * 24 * 30
        //   );
        //   const stuffbeforePayout = await proxiedDxcTokens.balanceOf(accounts[1]);
        //   assert.equal(
        //     Object.values(stuffbeforeDeal)[1]
        //       .add(web3.utils.toWei(amountOfDTXFor(50)))
        //       .toString(),
        //     Object.values(stuffbeforePayout)[1].toString()
        //   );
        //   // release escrow
        //   await proxiedDxcTokens.releaseEscrow(
        //     accounts[1],
        //     accounts[3],
        //     accounts[2],
        //     accounts[0],
        //     web3.utils.toWei(amountOfDTXFor(50)),
        //     new BN('70'),
        //     new BN('10'),
        //     new BN('15')
        //   );
        //   const amount = amountOfDTXFor(50);
        //   // transfer DTX
        //   await proxiedDxcTokens.transferEx(
        //     accounts[1],
        //     accounts[3],
        //     web3.utils.toWei(amount.mul(new BN(70)).div(new BN(100)))
        //   );
        //   await proxiedDxcTokens.transferEx(
        //     accounts[1],
        //     accounts[2],
        //     web3.utils.toWei(amount.mul(new BN(10)).div(new BN(100)))
        //   );
        //   await proxiedDxcTokens.transferEx(
        //     accounts[1],
        //     accounts[0],
        //     web3.utils.toWei(amount.mul(new BN(15)).div(new BN(100)))
        //   );
        //   const protocolAmount = amount.sub(
        //     amount
        //       .mul(new BN(70))
        //       .div(new BN(100))
        //       .add(amount.mul(new BN(10)).div(new BN(100)))
        //       .add(amount.mul(new BN(15)).div(new BN(100)))
        //   );
        //   await proxiedDxcTokens.transferEx(
        //     accounts[1],
        //     proxiedDxcTokens.address,
        //     web3.utils.toWei(protocolAmount)
        //   );
        //   const stuffafter = await proxiedDxcTokens.balanceOf(accounts[1]);
        //   assert.equal(
        //     stuffafter[1].toString(),
        //     stuffbeforePayout[1]
        //       .sub(web3.utils.toWei(amountOfDTXFor(50)))
        //       .toString()
        //   );
        // });
    });
});
//# sourceMappingURL=dxc.js.map