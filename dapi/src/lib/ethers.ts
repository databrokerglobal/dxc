import { Contract, providers, Wallet } from 'ethers';
import { abi } from '../../contracts/artifacts/DXC.json';
import { DXCInstance } from '../types/truffle-contracts/index';
import { contractAddress, networkUrl, platformMnemonic } from './variables';

export const provider = new providers.JsonRpcProvider(networkUrl);
const platformWallet = Wallet.fromMnemonic(platformMnemonic);
const connectedPlatformWallet = platformWallet.connect(provider);
export const dxcContract: DXCInstance = new Contract(
  contractAddress,
  abi,
  connectedPlatformWallet
) as any;

const baseNonce = provider.getTransactionCount(platformWallet.getAddress());
let nonceOffset = 0;

export async function getNonce() {
  const nonce = await baseNonce;
  return nonce + nonceOffset++;
}
