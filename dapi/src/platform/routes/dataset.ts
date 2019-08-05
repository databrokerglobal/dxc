import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import {
  balanceOfUser,
  dealsForAddress,
  depositFromFiat,
  recordDeal,
} from '../../lib/deal';

export const path = '/platform/deal/dataset';

export const route: ServerRoute = {
  method: 'POST',
  path,
  options: {
    auth: 'jwtadmin',
    tags: ['api'],
    description: 'Purchase a dataset',
    // notes: 'sss',
    validate: {
      payload: {
        payment: Joi.string()
          .optional()
          .allow(['fiat', 'dtx'])
          .example('fiat')
          .default('fiat'),
        did: Joi.string()
          .required()
          .example('did:dxc:localhost:12345'),
        owner: Joi.string()
          .required()
          .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
        ownerPercentage: Joi.number()
          .required()
          .max(100)
          .min(0)
          .precision(0)
          .example(80),
        publisher: Joi.string()
          .required()
          .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
        publisherPercentage: Joi.number()
          .required()
          .max(100)
          .min(0)
          .precision(0)
          .example(10),
        user: Joi.string()
          .required()
          .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
        marketplace: Joi.string()
          .required()
          .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
        marketplacePercentage: Joi.number()
          .required()
          .max(100)
          .min(0)
          .precision(0)
          .example(5),
        amount: Joi.number()
          .required()
          .min(0)
          .example(500000)
          .precision(0),
        validFrom: Joi.number()
          .min(0)
          .precision(0)
          .required()
          .example(Math.ceil(Date.now() / 1000)),
        validUntil: Joi.number()
          .min(0)
          .precision(0)
          .required()
          .example(Math.ceil(Date.now() / 1000) + 24 * 60 * 60 * 30),
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
    const {
      did,
      owner,
      ownerPercentage,
      publisher,
      publisherPercentage,
      user,
      marketplace,
      marketplacePercentage,
      amount,
      validFrom,
      validUntil,
      payment,
    } = request.payload as any;

    if (payment === 'fiat') {
      depositFromFiat(user, amount);
    }

    await recordDeal(
      did,
      owner,
      ownerPercentage,
      publisher,
      publisherPercentage,
      user,
      marketplace,
      marketplacePercentage,
      amount,
      validFrom,
      validUntil
    );

    return {
      deals: await dealsForAddress(user),
      balances: await balanceOfUser(user),
    };
  },
};
