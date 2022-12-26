import { User } from '@prisma/client';
import { Request } from 'express';

export type Generic<T = unknown> = Record<string, T>;

export type AppRequest = Request & {
  user: User;
};
