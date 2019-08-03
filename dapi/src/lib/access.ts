import { Contract, providers } from 'ethers';
import LRU from 'lru-cache';
import { abi } from '../../contracts/artifacts/DXC.json';
import { DXCInstance } from '../types/truffle-contracts/index';
import { contractAddress, networkUrl } from './variables';

const provider = new providers.JsonRpcProvider(networkUrl);
const dxcContract: DXCInstance = new Contract(
  contractAddress,
  abi,
  provider
) as any;

const cache = new LRU({
  max: 500,
  maxAge: 60,
});

export async function checkAccess(did: string, address: string) {
  let hasAccess = cache.get(`${did}${address}`);
  if (!hasAccess) {
    hasAccess = dxcContract.hasAccessToDiD(did, address);
    cache.set(`${did}${address}`, hasAccess);
  }
  return hasAccess;
}

export async function recordDeal(
  did: string,
  owner: string,
  ownerPercentage: number,
  publisher: string,
  publisherPercentage: number,
  user: string,
  marketplace: string,
  marketplacePercentage: number,
  amount: number,
  validFrom: number,
  validUntil: number
) {
  await dxcContract.createDeal(
    did,
    owner,
    ownerPercentage,
    publisher,
    publisherPercentage,
    user,
    marketplace,
    marketplacePercentage,
    amount,
    validFrom,
    validUntil
  );

  const index = 1;
  return index;
}
