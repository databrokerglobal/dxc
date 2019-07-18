import Hapi, { ServerRoute } from '@hapi/hapi';
import Joi from '@hapi/joi';
import * as bip39 from 'bip39';
import crypto from 'crypto';
import { Challenge } from '../../entity/Challenge';
import { getDb } from '../../lib/db';

export const route: ServerRoute = {
  method: 'POST',
  path: '/auth/challenge',
  options: {
    auth: false,
    tags: ['api'],
    description:
      'Generate a random challenge that needs to be signed with your Ethereum private key',
    // notes: 'sss',
    validate: {
      payload: Joi.object().keys({
        ethereumAddress: Joi.string()
          .regex(/^0x[0-9a-fA-F]{40}$/)
          .required()
          .description('your Ethereum address')
          .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
      }),
    },
    response: {
      status: {
        200: Joi.object().keys({
          challenge: Joi.string()
            .description('a random string to sign')
            .example(
              'people lottery school never swarm clown track moment sleep recycle celery hill'
            ),
          ethereumAddress: Joi.string()
            .regex(/^0x[0-9a-fA-F]{40}$/)
            .required()
            .description('your Ethereum address')
            .example('0xA74de4DbB12130c5A5e98233D05200d3dE0da7d6'),
        }),
      },
    },
  },
  async handler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    // generate a random mnemonic phrase
    const mnemonic = bip39.entropyToMnemonic(
      crypto.randomBytes(16).toString('hex')
    );

    // create a new Challenge entity
    const { ethereumAddress } = request.payload as any;
    const challenge = new Challenge();
    challenge.challenge = mnemonic;
    challenge.ethereumAddress = ethereumAddress;

    // save the Challenge
    const challengeRepository = getDb(request).getRepository(Challenge);
    await challengeRepository.save(challenge);

    // return the Challenge
    return challenge;
  },
};
