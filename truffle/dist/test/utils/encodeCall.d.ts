import { ParamType } from 'ethers/utils/abi-coder';
export declare function encodeParams(types?: Array<string | ParamType>, rawValues?: any[]): string;
export declare function encodeCall(name: string, types?: Array<string | ParamType>, rawValues?: any[]): string;
export declare function decodeCall(types?: Array<string | ParamType>, data?: any[]): any[];
