export const chroot = './storage/datasets';
import * as DXC from '../../contracts/artifacts/DXC.json';

export const networkUrl =
  process.env.NETWORK_URL ||
  'https://mainnet.infura.io/v3/9b42255764494e9bac0c265a977f0f67';

export const contractAddress =
  DXC.networks[process.env.NETWORK_ID || 1].address;

export const platformMnemonic =
  process.env.PLATFORM_MNEMONIC ||
  'robot robot robot robot robot robot robot robot robot robot robot robot';
