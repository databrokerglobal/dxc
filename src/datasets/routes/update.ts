import Boom from '@hapi/boom';
import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import crypto from 'crypto';
import fs from 'fs';
import Path from 'path';
import { DataSet } from '../../entity/DataSet';
import { getDb } from '../../lib/db';

const chroot = '/var/dxc/datasets';

export const route: ServerRoute = {
  method: 'PATCH',
  path: '/datasets/{did}',
  options: {
    tags: ['api'],
    description: 'Modify a dataset in this DXC',
    // notes: 'sss',
    validate: {
      payload: {
        path: Joi.string()
          .required()
          .example('sponsorlogo_vlaio.zip')
          .description(
            `This should point to a dataset on the local datasetsystem in ${chroot}, mounted as a volume to the Docker container`
          ),
        variable: Joi.boolean()
          .optional()
          .default(false)
          .example(false),
      },
    },
    response: {
      status: {
        200: Joi.object().keys({
          did: Joi.string().example('did:dxc:localhost:12345'),
          path: Joi.string()
            .example('sponsorlogo_vlaio.zip')
            .description(
              'This should point to a dataset on the local datasetsystem in /var/dxc/datasets, mounted as a volume to the Docker container'
            ),
          variable: Joi.boolean()
            .optional()
            .default(false)
            .example(false),
          hash: Joi.string().example(
            'fbca5e55a6ea11c39fa62e5ead485a6c0b780967b8aae2c6df35f05b9fbb52ec'
          ),
        }),
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    if (!fs.existsSync(Path.resolve(chroot))) {
      fs.mkdirSync(Path.resolve(chroot));
    }

    const datasetRepository = getDb(request).getRepository(DataSet);

    const existingDataSet = await datasetRepository.findOne({
      did: (request.payload as any).did,
    });
    if (!existingDataSet) {
      return Boom.conflict(
        'This DID does not exist yet in this DXC, create it first'
      );
    }

    existingDataSet.path = (request.payload as any).path;

    if (!(request.payload as any).variable) {
      const stream = fs.createReadStream(
        Path.resolve(chroot, existingDataSet.path)
      );
      const hash = crypto.createHash('sha256');
      hash.setEncoding('hex');
      stream.pipe(hash);
      const streamPromise = new Promise<string>((resolve, reject) => {
        stream.on('end', () => {
          hash.end();
          resolve(hash.read());
        });
        hash.on('error', reject);
        stream.on('error', reject);
      });
      existingDataSet.hash = await streamPromise;
    }

    await datasetRepository.save(existingDataSet);
    return existingDataSet;
  },
};
