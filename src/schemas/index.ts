import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import { loadSchema } from '@graphql-tools/load';
import { makeExecutableSchema } from '@graphql-tools/schema';
import resolvers from '../resolvers';
import { GraphQLSchema } from 'graphql';
import logger from '../helpers/logger';

const schemaPath = './**/*.graphql';

const getSchema = async () => {
  try {
    const typeDefs = await loadSchema(schemaPath, {
      // load files and merge them into a single schema object
      loaders: [new GraphQLFileLoader()],
    });
    const schema: GraphQLSchema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    return schema;
  } catch (error) {
    logger.error('☸️ Schema errors', error);
  }
};

export default getSchema;
