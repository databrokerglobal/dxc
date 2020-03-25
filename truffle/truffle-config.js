const PrivateKeyProvider = require('truffle-privatekey-provider');
const solcconfig = require('./solcconfig.json');

module.exports = {
  migrations_directory: './dist/migrations',
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
      websockets: true, // Enable EventEmitter interface for web3 (default: false)
    },
    launchpad: {
      provider: () => {
        return new PrivateKeyProvider('PRIVATEKEY', `RPCENDPOINT`);
      },
      gasPrice: '0',
      network_id: '*',
      websockets: true,
      production: false,
    },
  },
  compilers: {
    solc: {
      version: solcconfig.version,
      settings: {
        optimizer: solcconfig.optimizer,
        evmVersion: solcconfig.evmVersion,
      },
    },
  },
};
