import { Server } from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import * as Sentry from '@sentry/node';
import chalk from 'chalk';
import dotenv from 'dotenv';
import Path from 'path';
import 'reflect-metadata';
import { Connection, createConnection } from 'typeorm';
import { version } from '../package.json';

// Generic setup

process.setMaxListeners(0);
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.on('unhandledRejection', reason => {
  console.error('unhandledRejection triggered', reason);
  throw reason; // be as verbose as possible and restart the container
});

// Start the webserver

async function run() {
  const connection = await createConnection();

  dotenv.config();
  if (process.env.MONITORING_SENTRY) {
    Sentry.init({
      dsn: process.env.MONITORING_SENTRY,
      release: version || '0.0.0-development',
    });
  }

  const server = new Server({
    port: process.env.PORT || 7000,
    routes: {
      cache: {
        privacy: 'public',
        expiresIn: 1000,
        statuses: [200],
        otherwise: 'no-cache',
      },
      cors: { origin: ['*'] },
      files: {
        relativeTo: Path.join(__dirname, 'public'),
      },
      payload: {
        maxBytes: 1073741824,
      },
      validate: {
        failAction: async (request, h, err) => {
          console.error(`failAction: ${err.message}`, err);
          throw err;
        },
      },
    },
  });

  (server.app as any).dbConnection = connection;

  const plugins = [];

  if (process.env.NODE_ENV === 'production' && process.env.MONITORING_SENTRY) {
    plugins.push(
      server.register({
        options: {
          client: {
            maxBreadcrumbs: 20,
            dsn: process.env.MONITORING_SENTRY,
            release: version,
          },
        },
        plugin: require('hapi-sentry'),
      })
    );
  }

  plugins.push(
    server.register({
      plugin: require('hapi-dev-errors'),
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
      },
    })
  );

  plugins.push(server.register([Vision, Inert]));

  plugins.push(
    server.register({
      options: {
        includes: {
          request: ['headers', 'payload'],
          response: ['headers', 'payload'],
        },
        reporters: {
          console: [
            {
              args: [
                {
                  response: '*',
                  log: '*',
                  sync: '*',
                  error: '*',
                },
              ],
              module: '@hapi/good-squeeze',
              name: 'Squeeze',
            },
            {
              args: [{ color: process.env.NODE_ENV !== 'production' }],
              module: '@hapi/good-console',
            },
            'stdout',
          ],
        },
      },
      plugin: require('@hapi/good'),
    })
  );

  plugins.push(
    server.register({
      plugin: require('hapi-swagger'),
      options: {
        info: {
          title: 'DataBrokerDAO DXC',
          version,
          contact: {
            name: 'DataBrokerDAO',
            email: 'hello@databrokerdao.com',
          },
        },
        swaggerUI: false,
        documentationPage: false,
        securityDefinitions: {
          Authorization: {
            in: 'header',
            name: 'Authorization',
            type: 'apiKey',
          },
        },
        cache: {
          expiresIn: 24 * 60 * 60 * 1000,
        },
        pathPrefixSize: 2,
      },
    })
  );

  server.views({
    engines: { hbs: require('handlebars') },
    relativeTo: Path.resolve(__dirname, '../'),
    path: ['./templates'],
    defaultExtension: 'hbs',
  });

  plugins.push(
    server.register(
      {
        plugin: require('./auth'),
      },
      {
        routes: {
          prefix: '/v1',
        },
      }
    )
  );
  plugins.push(
    server.register(
      { plugin: require('./datasets') },
      {
        routes: {
          prefix: '/v1',
        },
      }
    )
  );

  // if (process.env.ENABLE_PLATFORM_ENDPOINTS) {
  //   plugins.push(
  //     server.register(
  //       { plugin: require('./platform') },
  //       {
  //         routes: {
  //           prefix: '/v1',
  //         },
  //       }
  //     )
  //   );
  // }

  await Promise.all(plugins);

  server.route({
    method: 'GET',
    options: {
      auth: false,
      handler(request, h) {
        return h.view('api.hbs', {});
      },
    },
    path: '/',
  });

  server.route({
    method: 'GET',
    options: {
      auth: false,
    },
    path: '/{path*}',
    handler: {
      directory: {
        path: '.',
        index: true,
        listing: true,
      },
    },
  });

  console.info(
    chalk.red(`

  ██████╗  █████╗ ████████╗ █████╗ ██████╗ ██████╗  ██████╗ ██╗  ██╗███████╗██████╗ ██████╗  █████╗  ██████╗     ██████╗ ██╗  ██╗ ██████╗
  ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗██║ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔═══██╗    ██╔══██╗╚██╗██╔╝██╔════╝
  ██║  ██║███████║   ██║   ███████║██████╔╝██████╔╝██║   ██║█████╔╝ █████╗  ██████╔╝██║  ██║███████║██║   ██║    ██║  ██║ ╚███╔╝ ██║
  ██║  ██║██╔══██║   ██║   ██╔══██║██╔══██╗██╔══██╗██║   ██║██╔═██╗ ██╔══╝  ██╔══██╗██║  ██║██╔══██║██║   ██║    ██║  ██║ ██╔██╗ ██║
  ██████╔╝██║  ██║   ██║   ██║  ██║██████╔╝██║  ██║╚██████╔╝██║  ██╗███████╗██║  ██║██████╔╝██║  ██║╚██████╔╝    ██████╔╝██╔╝ ██╗╚██████╗
  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝

`)
  );
  console.info(
    chalk.green(
      `
      Starting the DXC on port ${process.env.PORT || 7000}

      `
    )
  );
  try {
    await server.start();
  } catch (error) {
    console.error(error);
  }

  return server;
}

export const runningServer: Promise<Server> = run();
