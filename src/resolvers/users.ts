import models from '../models';
import jwt from 'jsonwebtoken';

import {
  BadRequestError,
  ExistentUserError,
  TooManyAttempsError,
  UserCredentialsError,
  UserNotFoundError,
} from '../helpers/errors';
import { AppRequest } from '../types';
import {
  MutationCreateUserArgs,
  MutationLoginUserArgs,
} from '../generated/types';

export const resolver = {
  Query: {
    async users() {
      return [];
    },
  },
  Mutation: {
    async createUser(_: unknown, { user: input }: MutationCreateUserArgs) {
      const now = new Date();
      const { name, lastname, email } = input;

      try {
        const prevUser = await models.User.findFirst({
          where: {
            email: email.toLowerCase(),
          },
        });

        let user;

        if (prevUser && prevUser.deletedAt) {
          user = await models.User.update({
            where: {
              id: prevUser.id,
            },
            data: {
              name,
              lastname,
              createdAt: now,
              updatedAt: now,
              deletedAt: null,
            },
          });
        } else {
          user = await models.User.create({
            data: {
              name,
              lastname,
              email: email.toLowerCase(),
              createdAt: now,
              updatedAt: now,
            },
          });
        }

        const data = {
          id: user.id,
        };

        const accessToken = jwt.sign(data, process.env.TOKEN_SECRET ?? '');

        return {
          ...user,
          accessToken,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
          throw new ExistentUserError('email_already_exists');
        }

        if (e.code === 'auth/weak-password') {
          throw new BadRequestError('weak_password');
        }

        throw new BadRequestError('bad_request');
      }
    },

    async loginUser(_: unknown, { user: input }: MutationLoginUserArgs) {
      const { email } = input;

      try {
        const registered = await models.User.findFirst({
          where: {
            email: email.toLowerCase(),
            AND: {
              deletedAt: null,
            },
          },
        });

        if (!registered) {
          throw new UserNotFoundError('user_not_found');
        }

        const data = {
          id: registered.id,
        };

        const accessToken = jwt.sign(data, process.env.TOKEN_SECRET ?? '');

        return {
          ...registered,
          accessToken,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        if (e.code === 'auth/too-many-requests') {
          throw new TooManyAttempsError('too_many_attemps');
        }

        if (e.code === 'auth/weak-password') {
          throw new BadRequestError('weak_password');
        }

        if (e.code === 'auth/wrong-password') {
          throw new UserCredentialsError('invalid_credentials');
        }

        throw e;
      }
    },

    async deleteUser(_: unknown, __: unknown, req: AppRequest) {
      const now = new Date();
      const userId = req.user.id;

      const user = await models.User.findUnique({
        where: {
          id: userId,
        },
      });

      if (!user || user.deletedAt) {
        throw new UserNotFoundError('user_not_found');
      }

      await models.User.update({
        where: {
          id: userId,
        },
        data: {
          updatedAt: now,
          deletedAt: now,
        },
      });

      return null;
    },
  },
};
