import { PrismaClient } from '@prisma/client';
import logger from '../helpers/logger';

export const prisma = new PrismaClient();

export const initPrisma = async () => {
  try {
    await prisma
      .$connect()
      .then(() => logger.info('🐘  PostgreSQL connected'))
      .catch((err) => logger.error(`🐘  PostgreSQL connection error`, err));
  } catch (e) {
    logger.error(`🐘  PostgreSQL connection error`, e);
  }
};
