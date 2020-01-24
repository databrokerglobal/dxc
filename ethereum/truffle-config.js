const PrivateKeyProvider = require('truffle-privatekey-provider');
const HDWalletProvider = require('truffle-hdwallet-provider');
const solcconfig = require('./solcconfig.json');
const { ethers } = require('ethers');

module.exports = {
  migrations_directory: './dist/migrations',
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: '5777', // Any network (default: none)
      websockets: true, // Enable EventEmitter interface for web3 (default: false)
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // confirmations: 2,       // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true        // Skip dry run before migrations? (default: false for public nets )
      // production: true        // Treats this network as if it was a public net. (default: false)
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
    mintnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED ||
            'vocal mention afraid vapor female birth airport already black venture faint affair',
          'https://mintnet.settlemint.com'
        );
      },
      gasPrice: '0',
      network_id: '8995',
      websockets: true,
      production: false,
    },
    minttestnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED ||
            'vocal mention afraid vapor female birth airport already black venture faint affair',
          'https://minttestnet.settlemint.com'
        );
      },
      gasPrice: '0',
      network_id: '8996',
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
