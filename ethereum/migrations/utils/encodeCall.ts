import { BigNumber } from 'ethers/utils';
import abi from 'ethereumjs-abi';

// BigNumber as a string pattern
export const SCIENTIFIC_NOTATION_PATTERN = /^\s*[-]?\d+(\.\d+)?[e,E](\+)?\d+\s*$/;

export function encodeCall (
  name: string,
  args: string[],
  rawValues: any[]
): string {
  const values = rawValues.map(formatValue);
  const methodId = abi.methodID(name, args).toString('hex');
  const params = abi.rawEncode(args, values).toString('hex');
  return `0x${methodId}${params}`;
}

function formatValue (value: number | string): string {
  if (BigNumber.isBigNumber(value)) return value.toString();
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string' && value.match(SCIENTIFIC_NOTATION_PATTERN))
    return new BigNumber(Number(value)).toString();
  return value;
}
