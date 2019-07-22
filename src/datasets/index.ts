import Hapi from '@hapi/hapi';
import { route as createRoute } from './routes/create';
import { route as listRoute } from './routes/list';
// import { route as signChallengeRoute } from './routes/sign-challenge';

export const name = 'DataSets';

export async function register(server: Hapi.Server) {
  server.route([listRoute, createRoute]);
}
