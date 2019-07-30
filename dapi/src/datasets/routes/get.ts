import Boom from '@hapi/boom';
import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import fileType from 'file-type';
import fs from 'fs';
import Path from 'path';
import { DataSet } from '../../entity/DataSet';
import { checkAccess } from '../../lib/access';
import { getDb } from '../../lib/db';
import { chroot } from '../../lib/variables';

export const route: ServerRoute = {
  method: 'GET',
  path: '/datasets/{did}',
  options: {
    tags: ['api'],
    description: 'Get the datasets from this DXC, if you have access',
    // notes: 'sss',
    validate: {
      params: {
        did: Joi.string()
          .required()
          .example('did:dxc:localhost:12345'),
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const datasetRepository = getDb(request).getRepository(DataSet);

    const existingDataSet = await datasetRepository.findOne({
      did: (request.params as any).did,
    });
    if (!existingDataSet) {
      return Boom.conflict(
        'This DID does not exist yet in this DXC, create it first'
      );
    }

    if (
      !checkAccess(
        existingDataSet.did,
        (request.auth.credentials as any).ethereumAddress
      )
    ) {
      return Boom.unauthorized(
        'You do not have an active purchase for this file'
      );
    }

    const stream = await fileType.stream(
      fs.createReadStream(Path.resolve(chroot, existingDataSet.path))
    );

    return h
      .response(stream)
      .header(
        'Content-Type',
        `${stream.fileType ? stream.fileType.mime : 'application/octet-stream'}`
      )
      .header(
        'Content-Disposition',
        `attachment; filename=${Path.basename(
          Path.resolve(chroot, existingDataSet.path)
        )}`
      )
      .header('Content-Length', `${(stream as any).length}`)
      .header('Access-Control-Expose-Headers', 'Content-Disposition');
  },
};
