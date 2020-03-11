declare const config: {
    defaultNetwork: string;
    solc: {
        version: string;
        optimizer: {
            enabled: boolean;
            runs: number;
        };
        evmVersion: string;
    };
    analytics: {
        enabled: boolean;
    };
};
export default config;
