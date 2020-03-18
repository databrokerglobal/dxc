"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const encodeCall_1 = require("./utils/encodeCall");
const TF = artifacts.require('MiniMeTokenFactory');
const DTX = artifacts.require('DTXToken');
const DXC = artifacts.require('DXC');
const OUP = artifacts.require('OwnedUpgradeabilityProxy');
contract('DXC functionailities', async (accounts) => {
    it('Should depoy succesfully using proxy pattern', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcInstance = await DXC.new();
        const oUPinstance = await OUP.new();
        // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
        const data = encodeCall_1.encodeCall('initialize', ['address'], [dtxInstance.address]);
        // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
        assert.isOk(await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
            from: accounts[0],
        }));
        // Intitialize the proxied dxc instance
        const proxiedDxc = await DXC.at(oUPinstance.address);
        // check if the intial state is correct
        const val2 = await proxiedDxc.protocolPercentage();
        assert.equal(val2.toNumber(), 5);
    });
    it('Should create a deal successfully', async () => {
        const tfInstance = await TF.new();
        const dtxInstance = await DTX.new(tfInstance.address);
        const dxcInstance = await DXC.new();
        const oUPinstance = await OUP.new();
        // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
        const data = encodeCall_1.encodeCall('initialize', ['address'], [dtxInstance.address]);
        // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
        assert.isOk(await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
            from: accounts[0],
        }));
        // Intitialize the proxied dxc instance
        const proxiedDxc = await DXC.at(oUPinstance.address);
        const platformBalance = await proxiedDxc.platformBalance();
        console.log(platformBalance.toNumber());
        // All percentages here need to add up to a 100: 15 + 70 + 10 = 95 + protocol percentage 5 = 100
        await proxiedDxc.createDeal('did:databroker:deal2:weatherdata', accounts[1], 15, accounts[2], 70, accounts[3], accounts[4], 10, 5, 0, 0);
    });
    // it('Should depoy succesfully using proxy pattern', async () => {
    //   const tfInstance: MiniMeTokenFactoryInstance = await TF.new();
    //   const dtxInstance: DTXTokenInstance = await DTX.new(tfInstance.address);
    //   const dxcInstance: DXCInstance = await DXC.new();
    //   const oUPinstance: OwnedUpgradeabilityProxyInstance = await OUP.new();
    //   // Encode the calling of the function initialize with the argument dtxInstance.address to bytes
    //   const data = encodeCall('initialize', ['address'], [dtxInstance.address]);
    //   // point proxy contract to dxc contract and call the initialize function which is analogous to a constructor
    //   assert.isOk(
    //     await oUPinstance.upgradeToAndCall(dxcInstance.address, data, {
    //       from: accounts[0],
    //     })
    //   );
    //   // Intitialize the proxied dxc instance
    //   const proxiedDxc = await DXC.at(oUPinstance.address);
    // });
});
//# sourceMappingURL=dxc.js.map