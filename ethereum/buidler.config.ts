import { BuidlerConfig, usePlugin } from '@nomiclabs/buidler/config';
import waffleDefaultAccounts from 'ethereum-waffle/dist/config/defaultAccounts';

// tslint:disable-next-line: no-default-import
import solcconfig from './solcconfig.json';

usePlugin('@nomiclabs/buidler-ethers');
usePlugin('@nomiclabs/buidler-solhint');
usePlugin('buidler-typechain');
usePlugin('@nomiclabs/buidler-truffle5');

const config: BuidlerConfig = {
  defaultNetwork: 'buidlerevm',
  solc: solcconfig,
  typechain: {
    target: 'ethers',
  },
  networks: {
    buidlerevm: {
      accounts: waffleDefaultAccounts.map(acc => ({
        balance: acc.balance,
        privateKey: acc.secretKey,
      })),
    },
  },
  analytics: {
    enabled: false,
  },
};

// tslint:disable-next-line: no-default-export
export default config;
