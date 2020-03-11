"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nomiclabs/buidler/config");
// tslint:disable-next-line: no-default-import
const solcconfig_json_1 = __importDefault(require("./solcconfig.json"));
config_1.usePlugin('@nomiclabs/buidler-truffle5');
config_1.usePlugin('@nomiclabs/buidler-solhint');
const config = {
    defaultNetwork: 'buidlerevm',
    solc: solcconfig_json_1.default,
    analytics: {
        enabled: false,
    },
};
// tslint:disable-next-line: no-default-export
exports.default = config;
//# sourceMappingURL=buidler.config.js.map