import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import { balanceOfUser } from '../../lib/deal';

export const path = '/platform/balances/{address}';

export const route: ServerRoute = {
  method: 'GET',
  path,
  options: {
    auth: false,
    tags: ['api'],
    description:
      'Returns the balance in DTX (wei) available in the platform, escrowed and outside the platform',
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
        200: Joi.object().keys({
          address: Joi.string().example(
            '0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'
          ),
          balance: Joi.string().example('148143086000000000000000000'),
          escrowOutgoing: Joi.string().example('3000000'),
          escrowIncoming: Joi.string().example('2850000'),
          available: Joi.string().example('148143085999999999997000000'),
          globalBalance: Joi.string().example('0'),
        }),
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const { address } = request.params as any;
    return {
      address,
      ...(await balanceOfUser(address)),
    };
  },
};
