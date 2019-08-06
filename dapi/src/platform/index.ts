import Hapi from '@hapi/hapi';
import { route as datasetRoute } from './routes/dataset';
import { route as balanceRoute } from './routes/getbalance';
import { route as dealByAddressRoute } from './routes/getdealsbyaddress';
import { route as dealByDIDRoute } from './routes/getdealsbydid';

export const name = 'Platform';

export async function register(server: Hapi.Server) {
  server.route([
    datasetRoute,
    dealByAddressRoute,
    dealByDIDRoute,
    balanceRoute,
  ]);
}
