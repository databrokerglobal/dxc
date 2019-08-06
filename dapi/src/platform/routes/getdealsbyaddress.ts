import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import {
  balanceOfUser,
  dealsForAddress,
  depositFromFiat,
  recordDeal,
} from '../../lib/deal';

export const path = '/platform/deal/datasets/address/{address}';

export const route: ServerRoute = {
  method: 'GET',
  path,
  options: {
    auth: false,
    tags: ['api'],
    description: 'Get all deals involving the address',
    // notes: 'sss',
    validate: {
      params: {
        address: Joi.string()
          .required()
          .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
      },
    },
    response: {
      status: {
        200: Joi.array().items({
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
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { address } = request.params as any;
    return dealsForAddress(address);
  },
};
