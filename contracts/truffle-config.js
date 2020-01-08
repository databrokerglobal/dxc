/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 */

require('ts-node/register');
const HDWalletProvider = require('truffle-hdwallet-provider'); // eslint-disable-line

module.exports = {
  plugins: [
    'truffle-security',
    '@neos1/truffle-plugin-docs',
    'truffle-plugin-verify',
  ],

  api_keys: {
    etherscan: 'MY_API_KEY',
  },

  test_file_extension_regexp: /.*\.ts$/,
  migrations_directory: './dist/migrations',

  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.

    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: '*', // Any network (default: none)
      websockets: true, // Enable EventEmitter interface for web3 (default: false)
      // gas: 8500000,           // Gas sent with each transaction (default: ~6700000)
      // gasPrice: 20000000000,  // 20 gwei (in wei) (default: 100 gwei)
      // from: <address>,        // Account to send txs from (default: accounts[0])
      // confirmations: 2,       // # of confs to wait between deployments. (default: 0)
      // timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      // skipDryRun: true        // Skip dry run before migrations? (default: false for public nets )
      // production: true        // Treats this network as if it was a public net. (default: false)
    },
    mintnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED ||
            'robot robot robot robot robot robot robot robot robot robot robot robot',
          process.env.ETHEREUM_MINTNET_URL || 'https://mintnet.settlemint.com'
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
            'robot robot robot robot robot robot robot robot robot robot robot robot',
          'https://minttestnet.settlemint.com'
        );
      },
      gasPrice: '0',
      network_id: '8996',
      websockets: true,
      production: true,
    },
    tobalaba: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED ||
            'robot robot robot robot robot robot robot robot robot robot robot robot',
          'https://tobalaba.settlemint.com/'
        );
      },
      network_id: '401697',
      websockets: true,
      production: true,
    },
    kovan: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://kovan.infura.io/v3/e4d0be7562d44d0880ded0147cacd3e4'
        );
      },
      network_id: '42',
      gas: 4700000,
      websockets: true,
      production: true,
    },
    ropsten: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://ropsten.infura.io/v3/e4d0be7562d44d0880ded0147cacd3e4'
        );
      },
      network_id: '3',
      websockets: true,
      production: true,
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://rinkeby.infura.io/v3/e4d0be7562d44d0880ded0147cacd3e4'
        );
      },
      network_id: '4',
      websockets: true,
      production: true,
    },
    mainnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.ETHEREUM_DEPLOYER_SEED,
          'https://mainnet.infura.io/v3/e4d0be7562d44d0880ded0147cacd3e4'
        );
      },
      network_id: '1',
      websockets: true,
      production: true,
    },
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
    reporter: 'eth-gas-reporter',
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: '0.5.10', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true, // Use "0.5.4" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'byzantium',
      },
    },
  },
};
