import Hapi from '@hapi/hapi';
import { Wallet } from 'ethers';
import HapiAuthJwt2 from 'hapi-auth-jwt2';
import { platformMnemonic } from '../lib/variables';
import { route as authenticateRoute } from './routes/authenticate';
import { route as burnerWalletRoute } from './routes/burnerwallet';
import { route as challengeRoute } from './routes/challenge';
import { route as signChallengeRoute } from './routes/sign-challenge';

export const name = 'Auth';

export async function register(server: Hapi.Server) {
  await server.register(HapiAuthJwt2);

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.JWT_SECRET || 's3cr3t',
    validate: async (decoded, request) => {
      return { isValid: true };
    },
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.strategy('jwtadmin', 'jwt', {
    key: process.env.JWT_SECRET || 's3cr3t',
    validate: async (decoded, request) => {
      const wallet = Wallet.fromMnemonic(platformMnemonic);
      return {
        isValid: (decoded as any).ethereumAddress === wallet.address,
      };
    },
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default('jwt');

  server.route([
    challengeRoute,
    signChallengeRoute,
    authenticateRoute,
    burnerWalletRoute,
  ]);
}
