declare module '*.json' {
  export const version: string;
  export const abi: Array;
  export const networks: {
    [networkID: string]: {
      address: string;
    };
  };
}
