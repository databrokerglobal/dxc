import {
  TokenContract,
  OwnedUpgradeabilityProxyContract,
  TokenUpgradeContract,
} from '../types/truffle-contracts';
import { encodeCall } from '../migrations/utils/encodeCall';

const Token: TokenContract = artifacts.require('Token');
const Proxy: OwnedUpgradeabilityProxyContract = artifacts.require(
  'OwnedUpgradeabilityProxy'
);
const TokenUpgraded: TokenUpgradeContract = artifacts.require('TokenUpgrade');

contract(
  'Upgrades flow should not error and retain storage',
  async accounts => {
    it('proxy should initially have no target', async () => {
      const proxy = await Proxy.new();
      assert.equal(
        await proxy.implementation(),
        '0x0000000000000000000000000000000000000000'
      );
      assert.equal(await proxy.proxyOwner(), accounts[0]);
    });

    it('when new target is set in proxy, initializing can only happen once', async () => {
      const proxy = await Proxy.new();
      const token = await Token.new();

      const initData = encodeCall('initialize', ['address'], [accounts[0]]);

      assert.isOk(
        await proxy.upgradeToAndCall(token.address, initData, {
          from: accounts[0],
        })
      );

      const err = await proxy
        .upgradeToAndCall(token.address, initData, {
          from: accounts[0],
        })
        .catch(err => err);

      // if correctly initialized, then a second run throws an error
      assert.equal(
        String(err).includes('Error: Transaction reverted without a reason'),
        true
      );

      // check if data is accessible through the proxy
      const logicContractFromProxy = await Token.at(proxy.address);
      assert.equal(await logicContractFromProxy.owner(), accounts[0]);
    });

    it('after upgrading data should remain intact', async () => {
      const proxy = await Proxy.new();
      const token = await Token.new();

      const initData = encodeCall('initialize', ['address'], [accounts[0]]);

      assert.isOk(
        await proxy.upgradeToAndCall(token.address, initData, {
          from: accounts[0],
        })
      );

      const logicContractFromProxy = await Token.at(proxy.address);
      await logicContractFromProxy.mint(accounts[0], 100);

      const newToken = await TokenUpgraded.new();

      assert.isOk(await proxy.upgradeTo(newToken.address));

      const upgradedLogicContractFromProxy = await TokenUpgraded.at(
        proxy.address
      );

      assert.equal(
        await (
          await upgradedLogicContractFromProxy.balanceOf(accounts[0])
        ).toNumber(),
        100
      );

      await upgradedLogicContractFromProxy.burn(50);

      assert.equal(
        await (
          await upgradedLogicContractFromProxy.balanceOf(accounts[0])
        ).toNumber(),
        50
      );
    });
  }
);
