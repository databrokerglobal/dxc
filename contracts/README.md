# User guide

## Installing

Install the `mint` command line utility by installing from NPM.

```sh
npm i -g @settlemint/mint-cli
```

> You need an active license to do so, and you need to logged in to npm.com using an email account connected to your license. You can log in using the `npm login` command.

## Setting up a new Mint project

We will initialise a new Mint project. A Mint project is a pre-configured [Truffle project](https://truffleframework.com) and includes the latest best practices in developing Ethereum smart contracts.

All code is written in Typescript for flawless auto complete and checks, Solidity tyope checks are enabled by default and testing configurations for Travis-ci are available.

You can initialise a new project by running:

```sh
mint init
```

Next step is to configure your project using the cli. This command will create a `.env` file which will be used in the docker-compose configuration and can be used in online deployments as well. In the `mintrc.json` all your environments will be configured, traditionally, development, staging and production.

```sh
mint config
```

> Reminder, you need an active license to do so, and you need to logged in to npm.com using an email account connected to your license. You can log in using the `npm login` command.
