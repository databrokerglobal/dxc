import Boom from '@hapi/boom';
import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import { DataSet } from '../../entity/DataSet';
import { getDb } from '../../lib/db';

export const route: ServerRoute = {
  method: 'DELETE',
  path: '/datasets/{did}',
  options: {
    tags: ['api'],
    description: 'Delete a dataset from this DXC',
    // notes: 'sss',
    validate: {
      params: {
        did: Joi.string()
          .required()
          .example('did:dxc:localhost:12345'),
      },
    },
    response: {
      status: {
        200: Joi.object().keys({
          did: Joi.string().example('did:dxc:localhost:12345'),
          deleted: Joi.boolean().example(true),
        }),
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const datasetRepository = getDb(request).getRepository(DataSet);

    const existingDataSet = await datasetRepository.findOne({
      did: (request.params as any).did,
    });
    if (!existingDataSet) {
      return Boom.notFound('This DID is not added to this DXC');
    }
    await datasetRepository.delete(existingDataSet);
    return {
      did: (request.params as any).did,
      deleted: true,
    };
  },
};
