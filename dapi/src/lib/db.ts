import { Request } from '@hapi/hapi';
import { Connection } from 'typeorm';

export function getDb(request: Request) {
  return (request.server.app as any).dbConnection as Connection;
}
