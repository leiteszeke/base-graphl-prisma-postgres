import { Request, Response } from 'express';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { GraphQLServerOptions } from 'apollo-server-core/src/graphqlOptions';
import {
  ApolloServer,
  ApolloServerExpressConfig as C,
} from 'apollo-server-express';

export type FormatError = (
  graphQLError: GraphQLError,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any
) => GraphQLFormattedError;

export type ApolloServerExpressConfig = Omit<C, 'formatError'> & {
  formatError?: FormatError;
};

/**
 * A modified instance of apollo express server class
 * that calls formatError() method with the context value.
 */
export class CustomApolloServer extends ApolloServer {
  constructor(config: ApolloServerExpressConfig) {
    super(config as C);
  }

  async createGraphQLServerOptions(
    req: Request,
    res: Response
  ): Promise<GraphQLServerOptions> {
    const options = await super.createGraphQLServerOptions(req, res);

    if (typeof options.formatError === 'function') {
      const formatError = options.formatError as FormatError;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      options.formatError = (graphQLError: GraphQLError) => {
        return formatError(graphQLError, options.context);
      };
    }

    return options;
  }
}
