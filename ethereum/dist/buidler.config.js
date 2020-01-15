"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nomiclabs/buidler/config");
const defaultAccounts_1 = __importDefault(require("ethereum-waffle/dist/config/defaultAccounts"));
// tslint:disable-next-line: no-default-import
const solcconfig_json_1 = __importDefault(require("./solcconfig.json"));
config_1.usePlugin('@nomiclabs/buidler-ethers');
config_1.usePlugin('@nomiclabs/buidler-solhint');
config_1.usePlugin('buidler-typechain');
config_1.usePlugin('@nomiclabs/buidler-truffle5');
const config = {
    defaultNetwork: 'buidlerevm',
    solc: solcconfig_json_1.default,
    typechain: {
        target: 'ethers',
    },
    networks: {
        buidlerevm: {
            accounts: defaultAccounts_1.default.map(acc => ({
                balance: acc.balance,
                privateKey: acc.secretKey,
            })),
        },
    },
    analytics: {
        enabled: false,
    },
};
// tslint:disable-next-line: no-default-export
exports.default = config;
//# sourceMappingURL=buidler.config.js.map