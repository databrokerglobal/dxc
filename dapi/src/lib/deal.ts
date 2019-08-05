import { BigNumber, Contract, providers, utils, Wallet } from 'ethers';
import { abi } from '../../contracts/artifacts/DXC.json';
import { getLatestQuote } from '../lib/getLatestQuote';
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

export async function balanceOfUser(user: string) {
  const response = await dxcContract.balanceOf(user);
  const balances: {
    balance: string;
    escrowOutgoing: string;
    escrowIncoming: string;
    available: string;
    globalBalance: string;
  } = {
    balance: response[0].toString(),
    escrowOutgoing: response[1].toString(),
    escrowIncoming: response[2].toString(),
    available: response[3].toString(),
    globalBalance: response[4].toString(),
  };
  return balances;
}

export async function depositFromFiat(to: string, amountInEUR: number) {
  const amountInDTXWei = utils.parseEther(
    (await amountOfDTXFor(amountInEUR)).toString()
  );
  await dxcContract.convertFiatToToken(to, amountInDTXWei);
}

async function amountOfDTXFor(amountInEUR: number) {
  const latestQuote = await getLatestQuote();
  return BigNumber.from(Math.ceil(amountInEUR / latestQuote));
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
      if (BigNumber.isBigNumber(value)) {
        value = value.toString();
      }
      formattedItem[component.name] = value;
    }
    items.push(formattedItem);
  }
  return items;
}
