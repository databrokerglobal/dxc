import Hapi from '@hapi/hapi';
import { route as datasetRoute } from './routes/dataset';

export const name = 'Platform';

export async function register(server: Hapi.Server) {
  server.route([datasetRoute]);
}
