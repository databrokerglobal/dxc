import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import {
  balanceOfUser,
  dealsForAddress,
  depositFromFiat,
  recordDeal,
} from '../../lib/deal';

export const path = '/platform/deal/datasets';

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
          .example(50)
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
    response: {
      status: {
        200: Joi.object().keys({
          deals: Joi.array().items({
            did: Joi.string().example('did:dxc:localhost:12345'),
            owner: Joi.string().example(
              '0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'
            ),
            ownerPercentage: Joi.number()
              .max(100)
              .min(0)
              .precision(0)
              .example(80),
            publisher: Joi.string().example(
              '0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'
            ),
            publisherPercentage: Joi.number()
              .max(100)
              .min(0)
              .precision(0)
              .example(10),
            user: Joi.string().example(
              '0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'
            ),
            marketplace: Joi.string().example(
              '0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'
            ),
            marketplacePercentage: Joi.number()
              .max(100)
              .min(0)
              .precision(0)
              .example(5),
            amount: Joi.string().example('500000'),
            validFrom: Joi.string().example('1565031871'),
            validUntil: Joi.string().example('1567623871'),
          }),
          balances: {
            address: Joi.string().example(
              '0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'
            ),
            balance: Joi.string().example('148143086000000000000000000'),
            escrowOutgoing: Joi.string().example('3000000'),
            escrowIncoming: Joi.string().example('2850000'),
            available: Joi.string().example('148143085999999999997000000'),
            globalBalance: Joi.string().example('0'),
          },
        }),
      },
    },
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
      balances: {
        address: user,
        ...(await balanceOfUser(user)),
      },
    };
  },
};
