"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: Once we migrate to Web3 1.x, we could replace these two dependencies with Web3, since it uses these two under the hood: https://github.com/ethereum/web3.js/blob/1.0/packages/web3-eth-abi/src/index.js
const abi_coder_1 = require("ethers/utils/abi-coder");
const web3_1 = __importDefault(require("web3"));
function encodeParams(types = [], rawValues = []) {
    return abi_coder_1.defaultAbiCoder.encode(types, rawValues);
}
exports.encodeParams = encodeParams;
function encodeCall(name, types = [], rawValues = []) {
    const encodedParameters = encodeParams(types, rawValues).substring(2);
    const signatureHash = web3_1.default.utils
        .sha3(`${name}(${types.join(',')})`)
        .substring(2, 10);
    return `0x${signatureHash}${encodedParameters}`;
}
exports.encodeCall = encodeCall;
function decodeCall(types = [], data = []) {
    return abi_coder_1.defaultAbiCoder.decode(types, data);
}
exports.decodeCall = decodeCall;
//# sourceMappingURL=encodeCall.js.map