"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethereumjs_abi_1 = __importDefault(require("ethereumjs-abi"));
const utils_1 = require("ethers/utils");
// BigNumber as a string pattern
exports.SCIENTIFIC_NOTATION_PATTERN = /^\s*[-]?\d+(\.\d+)?[e,E](\+)?\d+\s*$/;
function encodeCall(name, args, rawValues) {
    const values = rawValues.map(formatValue);
    const methodId = ethereumjs_abi_1.default.methodID(name, args).toString('hex');
    const params = ethereumjs_abi_1.default.rawEncode(args, values).toString('hex');
    return `0x${methodId}${params}`;
}
exports.encodeCall = encodeCall;
function formatValue(value) {
    if (utils_1.BigNumber.isBigNumber(value)) {
        return value.toString();
    }
    if (typeof value === 'number') {
        return value.toString();
    }
    if (typeof value === 'string' && value.match(exports.SCIENTIFIC_NOTATION_PATTERN)) {
        return new utils_1.BigNumber(Number(value)).toString();
    }
    return value;
}
//# sourceMappingURL=encodeCall.js.map