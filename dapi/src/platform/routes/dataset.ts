import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import { Wallet } from 'ethers';

export const path = '/platform/deal/dataset';

export const route: ServerRoute = {
  method: 'POST',
  path,
  options: {
    tags: ['api'],
    description: 'Purchase a dataset',
    // notes: 'sss',
    validate: {
      query: {
        payment: Joi.string()
          .optional()
          .allow(['fiat', 'dtx'])
          .example('fiat')
          .default('fiat'),
      },
    },
    // response: {
    //   status: {
    //     200: Joi.object().keys({
    //       mnemonic: Joi.string()
    //         .description(
    //           '12 words that translate into your private key. Backup!'
    //         )
    //         .example(
    //           'panda live confirm tray topic join idea chief resist mixture frame market'
    //         ),
    //       ethereumAddress: Joi.string()
    //         .regex(/^0x[0-9a-fA-F]{40}$/)
    //         .required()
    //         .description('your Ethereum address')
    //         .example('0xD71512DA14b031f8A6cea83C94308db6c90510c5'),
    //       privateKey: Joi.string()
    //         .required()
    //         .description('the private key for the address')
    //         .example(
    //           '0xd0fd7debd0f4ec45698db553c5894cf912bed2b331dd404963ddf5b402b3eb59'
    //         ),
    //     }),
    //   },
    // },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const dxc =


  },
};
