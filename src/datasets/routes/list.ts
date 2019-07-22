import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import { DataSet } from '../../entity/DataSet';
import { getDb } from '../../lib/db';

export const route: ServerRoute = {
  method: 'GET',
  path: '/datasets',
  options: {
    // auth: 'jwt',
    tags: ['api'],
    description: 'List all the datasets in this DXC',
    // notes: 'sss',
    validate: {
      query: {
        offset: Joi.number()
          .optional()
          .example(5)
          .default(0),
        limit: Joi.number()
          .optional()
          .example(50)
          .default(20),
      },
    },
    response: {
      status: {
        200: Joi.object().keys({
          pagination: Joi.object().keys({
            offset: Joi.number(),
            limit: Joi.number(),
            total: Joi.number(),
          }),
          items: Joi.array().items({
            did: Joi.string(),
            path: Joi.string(),
            hash: Joi.string().optional(),
          }),
        }),
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const datasetRepository = getDb(request).getRepository(DataSet);
    const pagination = {
      offset: (request.query.offset as any) || 0,
      limit: (request.query.limit as any) || 20,
      total: 0,
    };
    const datasets = await datasetRepository.findAndCount({
      order: {
        did: 'ASC',
      },
      skip: pagination.offset,
      take: pagination.limit,
      cache: true,
    });
    pagination.total = datasets[1];
    return {
      pagination,
      items: datasets[0],
    };
  },
};
