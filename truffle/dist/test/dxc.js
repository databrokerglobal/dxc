"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bn_js_1 = __importDefault(require("bn.js"));
const encodeCall_1 = require("./utils/encodeCall");
const getLatestQuote_1 = require("./utils/getLatestQuote");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('DXC', async (accounts) => {
    describe('DXC functionalities', async () => {
        let tfInstance;
        let dtxInstance;
        let dxcInstance;
        let oUPinstance;
        let proxiedDxc;
        let latestQuote;
        function amountOfDTXFor(amountInUSD) {
            return new bn_js_1.default(amountInUSD / latestQuote);
        }
        before(async () => {
            latestQuote = await getLatestQuote_1.getLatestQuote();
            tfInstance = await TF.new();
            dtxInstance = await DTX.new(tfInstance.address);
            dxcInstance = await DXC.new();
            oUPinstance = await OUP.new();
            // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
            const data = encodeCall_1.encodeCall('initialize', ['address'], [dtxInstance.address]);
            // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
            assert.isOk(await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
                from: accounts[0],
            }));
            // Intitialize the proxied dxc instance
            proxiedDxc = await DXC.at(oUPinstance.address);
            await dtxInstance.generateTokens(proxiedDxc.address, web3.utils.toWei('1000000'));
            await dtxInstance.generateTokens(accounts[0], web3.utils.toWei('1000000'));
            await dtxInstance.generateTokens(accounts[1], web3.utils.toWei('1000000'));
            await proxiedDxc.platformDeposit(web3.utils.toWei('1000000'));
        });
        it('Should have a platform balance', async () => {
            expect(await (await proxiedDxc.platformBalance()).toString()).to.be.equal(web3.utils.toWei('1000000'));
        });
        it('Can read the balance of someone internally', async () => {
            const balanceResult = await proxiedDxc.balanceOf(accounts[0]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
        });
        it('Can convert from fiat money', async () => {
            let balanceResult = await proxiedDxc.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
            await proxiedDxc.convertFiatToToken(accounts[1], web3.utils.toWei(amountOfDTXFor(1)));
            balanceResult = await proxiedDxc.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(1).toString()));
        });
        it('Cannot convert from fiat money if the user is not the owner', async () => {
            let balanceResult = await proxiedDxc.balanceOf(accounts[2]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            try {
                await proxiedDxc.convertFiatToToken(accounts[2], web3.utils.toWei(amountOfDTXFor(100)), { from: accounts[9] });
                assert(false, 'Test succeeded when it should have failed');
            }
            catch (error) {
                assert.isTrue(error.toString().includes('caller is not the owner'));
            }
            balanceResult = await proxiedDxc.balanceOf(accounts[2]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Can deposit DTX tokens', async () => {
            await dtxInstance.generateTokens(accounts[3], web3.utils.toWei('1000000'));
            let balanceResult = await proxiedDxc.balanceOf(accounts[3]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            await dtxInstance.approve(proxiedDxc.address, web3.utils.toWei(amountOfDTXFor(100)), { from: accounts[3] });
            const allowanceResult = await dtxInstance.allowance(accounts[3], proxiedDxc.address);
            expect(allowanceResult.toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(100).toString()));
            await proxiedDxc.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
                from: accounts[3],
            });
            balanceResult = await proxiedDxc.balanceOf(accounts[3]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(100).toString()));
        });
        it('Cannot deposit DTX tokens if the allowance is too little', async () => {
            await dtxInstance.generateTokens(accounts[4], web3.utils.toWei(amountOfDTXFor(100)));
            let balanceResult = await proxiedDxc.balanceOf(accounts[4]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            await dtxInstance.approve(proxiedDxc.address, new bn_js_1.default('5'), {
                from: accounts[4],
            });
            const allowanceResult = await dtxInstance.allowance(accounts[4], proxiedDxc.address);
            expect(allowanceResult.toString()).to.be.equal(new bn_js_1.default('5').toString());
            try {
                await proxiedDxc.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
                    from: accounts[4],
                });
            }
            catch (error) {
                assert.isTrue(error.toString().includes('too little allowance'));
            }
            balanceResult = await proxiedDxc.balanceOf(accounts[4]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Cannot deposit DTX tokens if their is not enough DTX available', async () => {
            let balanceResult = await proxiedDxc.balanceOf(accounts[5]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
            await dtxInstance.approve(proxiedDxc.address, web3.utils.toWei(amountOfDTXFor(100)), { from: accounts[5] });
            const allowanceResult = await dtxInstance.allowance(accounts[5], proxiedDxc.address);
            expect(allowanceResult.toString()).to.be.equal(web3.utils.toWei(amountOfDTXFor(100).toString()));
            try {
                await proxiedDxc.deposit(web3.utils.toWei(amountOfDTXFor(100)), {
                    from: accounts[5],
                });
            }
            catch (error) {
                assert.isTrue(error.toString().includes('too little DTX'));
            }
            balanceResult = await proxiedDxc.balanceOf(accounts[5]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Can withdraw DTX tokens', async () => {
            const balanceResult1 = await proxiedDxc.balanceOf(accounts[1]);
            assert.isTrue(balanceResult1[0].toString() !== '0');
            await proxiedDxc.withdraw({
                from: accounts[1],
            });
            const balanceResult = await proxiedDxc.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(new bn_js_1.default(0).toString());
        });
        it('Should create a deal successfully', async () => {
            // All percentages here need to add up to a 100: 15 + 70 + 10 = 95 + protocol percentage 5 = 100
            await proxiedDxc.createDeal('did:databroker:deal2:weatherdata', accounts[1], 15, accounts[2], 70, accounts[3], accounts[4], 10, 5, 0, 0);
        });
        it('Can create a new deal only when the percentages add up to 100', async () => {
            try {
                await proxiedDxc.createDeal('did:dxc:12345', accounts[1], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[3], accounts[0], new bn_js_1.default('10'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            }
            catch (error) {
                assert.isTrue(error
                    .toString()
                    .includes('All percentages need to add up to exactly 100'));
            }
        });
        it('Can list all deals', async () => {
            await proxiedDxc.createDeal('did:dxc:12345', accounts[3], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[1], accounts[0], new bn_js_1.default('15'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            const deals = await proxiedDxc.allDeals();
            expect(deals.length).to.be.equal(2);
        });
        it('Can get the info for a deal', async () => {
            await proxiedDxc.createDeal('did:dxc:12345', accounts[3], new bn_js_1.default('70'), accounts[2], new bn_js_1.default('10'), accounts[1], accounts[0], new bn_js_1.default('15'), web3.utils.toWei(amountOfDTXFor(50)), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000) + 3600 * 24 * 30);
            const deal = await proxiedDxc.getDealByIndex(2);
            expect(deal.did).to.be.equal('did:dxc:12345');
        });
        it('Can get all the deals for a did', async () => {
            const deals = await proxiedDxc.dealsForDID('did:dxc:12345');
            expect(deals).to.be.length(2);
        });
        it('Can signal access to a did whithout blacklist/whitelist', async () => {
            let access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[6]);
            expect(access).to.be.equal(false);
        });
        it('Can signal access to a deal with blacklist/whitelist 1', async () => {
            let access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // Add user to blacklist
            await proxiedDxc.addPermissionsToDeal([accounts[1]], [], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxc.addPermissionsToDeal([], [], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal with blacklist/whitelist 2', async () => {
            let access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist without the user in it
            await proxiedDxc.addPermissionsToDeal([], [accounts[7]], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxc.addPermissionsToDeal([], [], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal whith blacklist/whitelist 3', async () => {
            let access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist with the user in it
            await proxiedDxc.addPermissionsToDeal([], [accounts[1]], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            await proxiedDxc.addPermissionsToDeal([], [], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal whith blacklist/whitelist 4', async () => {
            let access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist with the user in it and is in blacklist
            await proxiedDxc.addPermissionsToDeal([accounts[2]], [accounts[2]], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxc.addPermissionsToDeal([], [], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
        it('Can signal access to a deal whith blacklist/whitelist 5', async () => {
            let access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
            // add a whitelist without the user in it and is in blacklist
            await proxiedDxc.addPermissionsToDeal([accounts[2]], [accounts[7]], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(false);
            await proxiedDxc.addPermissionsToDeal([], [], 2);
            access = await proxiedDxc.hasAccessToDeal(2, accounts[1]);
            expect(access).to.be.equal(true);
        });
    });
});
//# sourceMappingURL=dxc.js.map