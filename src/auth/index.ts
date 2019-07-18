import Hapi from '@hapi/hapi';
import HapiAuthJwt2 from 'hapi-auth-jwt2';
import 'reflect-metadata';
import { route as authenticateRoute } from './routes/authenticate';
import { route as challengeRoute } from './routes/challenge';
import { route as signChallengeRoute } from './routes/sign-challenge';

export const name = 'Auth';

export async function register(server: Hapi.Server) {
  await server.register(HapiAuthJwt2);

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET || 's3cr3t',
    validate: async (decoded, request) => {
      if (false) {
        return { isValid: false };
      } else {
        return { isValid: true };
      }
    },
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default('jwt');

  server.route([challengeRoute, signChallengeRoute, authenticateRoute]);
}
