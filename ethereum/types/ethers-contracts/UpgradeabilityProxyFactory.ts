/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import {Contract, ContractFactory, Signer} from "ethers";
import {Provider} from "ethers/providers";
import {UnsignedTransaction} from "ethers/utils/transaction";

import {UpgradeabilityProxy} from "./UpgradeabilityProxy";

export class UpgradeabilityProxyFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(): Promise<UpgradeabilityProxy> {
    return super.deploy() as Promise<UpgradeabilityProxy>;
  }
  getDeployTransaction(): UnsignedTransaction {
    return super.getDeployTransaction();
  }
  attach(address: string): UpgradeabilityProxy {
    return super.attach(address) as UpgradeabilityProxy;
  }
  connect(signer: Signer): UpgradeabilityProxyFactory {
    return super.connect(signer) as UpgradeabilityProxyFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UpgradeabilityProxy {
    return new Contract(address, _abi, signerOrProvider) as UpgradeabilityProxy;
  }
}

const _abi = [
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address"
      }
    ],
    name: "Upgraded",
    type: "event"
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback"
  },
  {
    constant: true,
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "impl",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061012b806100206000396000f3fe6080604052600436106038577c010000000000000000000000000000000000000000000000000000000060003504635c60da1b81146085575b6000604060c0565b905073ffffffffffffffffffffffffffffffffffffffff8116606157600080fd5b60405136600082376000803683855af43d806000843e8180156081578184f35b8184fd5b348015609057600080fd5b50609760c0565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b604080517f6478632e70726f78792e696d706c656d656e746174696f6e000000000000000081529051908190036018019020549056fea265627a7a72315820370ee91822d562b34a5ecc90db7a89317428923b26eec7be2a4dbbf8b8aefa1364736f6c634300050d0032";