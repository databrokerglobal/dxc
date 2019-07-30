import Hapi from '@hapi/hapi';
import { route as createRoute } from './routes/create';
import { route as deleteRoute } from './routes/delete';
import { route as getRoute } from './routes/get';
import { route as listRoute } from './routes/list';
import { route as updateRoute } from './routes/update';

export const name = 'DataSets';

export async function register(server: Hapi.Server) {
  server.route([listRoute, createRoute, deleteRoute, updateRoute, getRoute]);
}
