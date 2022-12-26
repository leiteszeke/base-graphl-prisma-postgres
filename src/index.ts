// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config();

import 'reflect-metadata';
import express from 'express';
import http from 'http';
import helmet from 'helmet';
import getSchema from './schemas';
import { initPrisma } from './config/database';
import { GraphQLError } from 'graphql';
import { CustomApolloServer } from './lib/apollo/customServer';
import { Context } from './resolvers/context';
import authMiddleware from './middlewares/auth';
import logger from './helpers/logger';
import cors from 'cors';
import { initRedis } from './config/redis';

const PORT = process.env.PORT;
const isProduction = process.env.NODE_ENV === 'production';

async function startApolloServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  app.use('/assets', express.static(__dirname + '/assets'));

  // Routes outside authMiddleware
  app.use('/health', (_, res) => res.json({ status: 'ok' }));
  app.use('/tasks', async (req, res) => {
    if (req.headers['tasks-api-key'] !== process.env.TASKS_API_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({ data: [] });
  });

  app.use(authMiddleware());

  app.use(
    helmet({
      crossOriginEmbedderPolicy: isProduction,
      contentSecurityPolicy: isProduction ? undefined : false,
    })
  );
  const httpServer = http.createServer(app);

  await Promise.all([initPrisma(), initRedis()]);

  const schema = await getSchema();
  const server = new CustomApolloServer({
    persistedQueries: false,
    schema,
    context: async ({ req }) => {
      return {
        user: req.body.user,
        graphQL: {
          query: req.body.query,
          variables: req.body.variables,
        },
      };
    },
    formatError: (err: GraphQLError, context: Context) => {
      logger.error(`☸️ GraphQL ${err.extensions.code} error`, {
        errorMessage: err.message,
        code: err.extensions.code,
        input: context.graphQL,
      });

      return {
        message: err.message,
        code: err.extensions.code,
      };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  await new Promise<void>((resolve) =>
    httpServer.listen({ port: PORT }, resolve)
  );

  logger.info(
    `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
  );
}

startApolloServer();
