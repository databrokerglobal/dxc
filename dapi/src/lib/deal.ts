import { Contract, providers, utils, Wallet } from 'ethers';
import { abi } from '../../contracts/artifacts/DXC.json';
import { DXCInstance } from '../types/truffle-contracts/index';
import { IAbiMethodInputOrOutput } from './responseFormatter';
import { contractAddress, networkUrl, platformMnemonic } from './variables';

const provider = new providers.JsonRpcProvider(networkUrl);
const platformWallet = Wallet.fromMnemonic(platformMnemonic);
const connectedPlatformWallet = platformWallet.connect(provider);
const dxcContract: DXCInstance = new Contract(
  contractAddress,
  abi,
  connectedPlatformWallet
) as any;

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
  const { hash } = await dxcContract.createDeal(
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
  return provider.waitForTransaction(hash);
}

export async function dealsForAddress(address: string) {
  const response = await dxcContract.dealsForAddress(address);
  const method = abi.find(
    (abiMethod: IAbiMethodInputOrOutput) => abiMethod.name === 'dealsForAddress'
  );
  const items = [];
  for (const item of response) {
    const formattedItem = {};
    for (const component of method.outputs[0].components) {
      let value = item[component.name];
      if (utils.BigNumber.isBigNumber(value)) {
        value = value.toString();
      }
      formattedItem[component.name] = value;
    }
    items.push(formattedItem);
  }
  return items;
}
