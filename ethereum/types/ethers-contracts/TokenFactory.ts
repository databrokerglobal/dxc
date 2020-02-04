/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import {Contract, ContractFactory, Signer} from "ethers";
import {Provider} from "ethers/providers";
import {UnsignedTransaction} from "ethers/utils/transaction";

import {Token} from "./Token";

export class TokenFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(): Promise<Token> {
    return super.deploy() as Promise<Token>;
  }
  getDeployTransaction(): UnsignedTransaction {
    return super.getDeployTransaction();
  }
  attach(address: string): Token {
    return super.attach(address) as Token;
  }
  connect(signer: Signer): TokenFactory {
    return super.connect(signer) as TokenFactory;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): Token {
    return new Contract(address, _abi, signerOrProvider) as Token;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Approval",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousOwner",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "OwnershipTransferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "Transfer",
    type: "event"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256"
      }
    ],
    name: "decreaseApproval",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256"
      }
    ],
    name: "increaseApproval",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "initialize",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "mint",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address"
      },
      {
        internalType: "address",
        name: "to",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256"
      }
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address"
      }
    ],
    name: "transferOwnership",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];

const _bytecode =
  "0x60806040526100163364010000000061001b810204565b61003d565b60008054600160a060020a031916600160a060020a0392909216919091179055565b610afc8061004c6000396000f3fe608060405234801561001057600080fd5b50600436106100d1576000357c0100000000000000000000000000000000000000000000000000000000900480638da5cb5b1161008e5780638da5cb5b146101e6578063a9059cbb1461020a578063c4d66de814610236578063d73dd6231461025c578063dd62ed3e14610288578063f2fde38b146102b6576100d1565b8063095ea7b3146100d657806318160ddd1461010457806323b872dd1461011e57806340c10f1914610168578063661884631461019457806370a08231146101c0575b600080fd5b610102600480360360408110156100ec57600080fd5b50600160a060020a0381351690602001356102dc565b005b61010c61033e565b60408051918252519081900360200190f35b6101546004803603606081101561013457600080fd5b50600160a060020a03813581169160208101359091169060400135610344565b604080519115158252519081900360200190f35b6101026004803603604081101561017e57600080fd5b50600160a060020a0381351690602001356104bb565b610102600480360360408110156101aa57600080fd5b50600160a060020a03813516906020013561057d565b61010c600480360360208110156101d657600080fd5b5035600160a060020a0316610668565b6101ee610683565b60408051600160a060020a039092168252519081900360200190f35b6101546004803603604081101561022057600080fd5b50600160a060020a038135169060200135610692565b6101026004803603602081101561024c57600080fd5b5035600160a060020a0316610773565b6101026004803603604081101561027257600080fd5b50600160a060020a0381351690602001356107dc565b61010c6004803603604081101561029e57600080fd5b50600160a060020a0381358116916020013516610870565b610102600480360360208110156102cc57600080fd5b5035600160a060020a031661089b565b336000818152600360209081526040808320600160a060020a03871680855290835292819020859055805185815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a35050565b60015490565b6000600160a060020a03831661035957600080fd5b600160a060020a03841660009081526002602052604090205482111561037e57600080fd5b600160a060020a03841660009081526003602090815260408083203384529091529020548211156103ae57600080fd5b600160a060020a0384166000908152600260205260409020546103d7908363ffffffff61092a16565b600160a060020a03808616600090815260026020526040808220939093559085168152205461040c908363ffffffff61097316565b600160a060020a038085166000908152600260209081526040808320949094559187168152600382528281203382529091522054610450908363ffffffff61092a16565b600160a060020a03808616600081815260036020908152604080832033845282529182902094909455805186815290519287169391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929181900390910190a35060019392505050565b6104c3610683565b600160a060020a031633600160a060020a0316146104e057600080fd5b600160a060020a038216600090815260026020526040902054610509908263ffffffff61097316565b600160a060020a038316600090815260026020526040902055600154610535908263ffffffff61097316565b600155604080518281529051600160a060020a038416916000917fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9181900360200190a35050565b336000908152600360209081526040808320600160a060020a0386168452909152902054808211156105d257336000908152600360209081526040808320600160a060020a0387168452909152812055610607565b6105e2818363ffffffff61092a16565b336000908152600360209081526040808320600160a060020a03881684529091529020555b336000818152600360209081526040808320600160a060020a0388168085529083529281902054815190815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a3505050565b600160a060020a031660009081526002602052604090205490565b600054600160a060020a031690565b6000600160a060020a0383166106a757600080fd5b336000908152600260205260409020548211156106c357600080fd5b336000908152600260205260409020546106e3908363ffffffff61092a16565b3360009081526002602052604080822092909255600160a060020a03851681522054610715908363ffffffff61097316565b600160a060020a0384166000818152600260209081526040918290209390935580518581529051919233927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a350600192915050565b60005474010000000000000000000000000000000000000000900460ff161561079b57600080fd5b6107a4816109e7565b506000805474ff0000000000000000000000000000000000000000191674010000000000000000000000000000000000000000179055565b336000908152600360209081526040808320600160a060020a0386168452909152902054610810908263ffffffff61097316565b336000818152600360209081526040808320600160a060020a0388168085529083529281902085905580519485525191937f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929081900390910190a35050565b600160a060020a03918216600090815260036020908152604080832093909416825291909152205490565b6108a3610683565b600160a060020a031633600160a060020a0316146108c057600080fd5b600160a060020a0381166108d357600080fd5b7f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e06108fc610683565b60408051600160a060020a03928316815291841660208301528051918290030190a1610927816109e7565b50565b600061096c83836040518060400160405280601e81526020017f536166654d6174683a207375627472616374696f6e206f766572666c6f770000815250610a16565b9392505050565b60008282018381101561096c57604080517f08c379a000000000000000000000000000000000000000000000000000000000815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b6000805473ffffffffffffffffffffffffffffffffffffffff1916600160a060020a0392909216919091179055565b60008184841115610abf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610a84578181015183820152602001610a6c565b50505050905090810190601f168015610ab15780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b50505090039056fea265627a7a72315820b33dc4acc175130c68a6f45ae3b43cf22040ab460f299c033a7145d589ea303564736f6c634300050d0032";