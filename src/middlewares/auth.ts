import { Request, Response, NextFunction } from 'express';
import logger from '../helpers/logger';
import models from '../models';
import jwt from 'jsonwebtoken';
import gql from 'graphql-tag';
import { User } from '@prisma/client';

const publicQueries = ['loginUser', 'createUser'];

const parseQuery = (query: string) => {
  if (!query) {
    return false;
  }

  const parsed = gql`
    ${query}
  `;

  const value =
    // @ts-expect-error bad typing
    parsed?.definitions?.[0].selectionSet?.selections?.[0]?.name?.value;

  return publicQueries.includes(value);
};

const authMiddleware = () => {
  return async function (req: Request, res: Response, next: NextFunction) {
    const accessToken = req.headers && req.headers.authorization;
    const apiKey = req.headers && req.headers['x-api-key'];

    const isPublic = parseQuery(req.body.query);

    if (isPublic) {
      return next();
    }

    if (accessToken) {
      try {
        const verified = jwt.verify(
          accessToken.replace('Bearer ', ''),
          process.env.TOKEN_SECRET ?? ''
        );

        if (verified) {
          const verifiedUser = verified as User;

          const user = await models.User.findFirst({
            where: {
              id: verifiedUser.id,
            },
          });

          if (user) {
            req.body = {
              ...req.body,
              user,
            };

            return next();
          }
        }
      } catch (error) {
        logger.error('🚪 Access Token Auth Error', error);
      }
    }

    logger.debug(`No user with the provided token has been found.`, {
      withAccessToken: !!accessToken,
      withApiKey: !!apiKey,
    });

    return res.status(401).json({ message: 'Unauthorized' });
  };
};

export default authMiddleware;
