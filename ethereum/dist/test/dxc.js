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
            const balanceResult = await proxiedDxc.balanceOf(accounts[1]);
            expect(balanceResult[0].toString()).to.be.equal(web3.utils.toWei('0'));
            await proxiedDxc.convertFiatToToken(accounts[1], web3.utils.toWei(amountOfDTXFor(1)));
            // balanceResult = await proxiedDxc.balanceOf(accounts[1]);
            // expect(balanceResult[0].toString()).to.be.equal(
            //   web3.utils.toWei(amountOfDTXFor(1))
            // );
        });
        it('Should create a deal successfully', async () => {
            // All percentages here need to add up to a 100: 15 + 70 + 10 = 95 + protocol percentage 5 = 100
            await proxiedDxc.createDeal('did:databroker:deal2:weatherdata', accounts[1], 15, accounts[2], 70, accounts[3], accounts[4], 10, 5, 0, 0);
        });
    });
});
//# sourceMappingURL=dxc.js.map