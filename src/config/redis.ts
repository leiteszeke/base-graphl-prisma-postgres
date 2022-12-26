import { add, format, isAfter } from 'date-fns';
import { createClient } from 'redis';
import logger from '../helpers/logger';

const {
  REDIS_HOST = '127.0.0.1',
  REDIS_PORT = '6379',
  REDIS_PASS,
} = process.env;

type GenericInput = Record<string, unknown> | string | number | boolean;

const client = createClient({
  url: `redis://:${REDIS_PASS}@${REDIS_HOST}:${REDIS_PORT}`,
});

export const initRedis = async () => {
  try {
    await client.connect();

    logger.info('🧱 Redis connected');

    return Promise.resolve();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.message !== 'Socket already opened') {
      logger.error('🧱 Redis error', e);
      return Promise.reject();
    }
  }
};

const set = <T = GenericInput>(key: string, value: T | null) => {
  let input: T | string = '';

  switch (typeof value) {
    case 'object':
      input = JSON.stringify(value);
      break;

    case 'string':
    case 'number':
    case 'boolean':
    default:
      input = value;
      break;
  }

  client.set(key, input as string);
};

const get = async <T = unknown>(key: string): Promise<T | null> => {
  const stored = await client.get(key);

  if (!stored) {
    return null;
  }

  return JSON.parse(stored);
};

const clear = (key: string) => client.del(key);

const flush = () => client.flushAll();

const reset = (key: string) => {
  logger.info(`Voy a resetear ${key}`);

  clear(key);
};

const from = async <T = unknown>(key: string, force = false) => {
  const saved: string | null = await get(key);

  if (!saved) {
    return null;
  }

  const parsed = saved as unknown as { data: T; expiresAt: string };

  if (!parsed) {
    return null;
  }

  if (force) {
    return parsed.data;
  }

  const expiresAt = new Date(parsed.expiresAt);
  const now = new Date();

  if (isAfter(now, expiresAt)) {
    return null;
  }

  return parsed.data;
};

const save = <T = unknown[]>(
  key: string,
  data: T,
  createdAt: Date | null = null,
  expiration = 1440
) => {
  createdAt = !createdAt ? new Date() : createdAt;
  const expiresAt = add(createdAt, {
    minutes: expiration,
  });

  logger.info(
    `Saving ${key} into redis from ${format(
      createdAt,
      'dd/MM/yyyy HH:mm'
    )} to ${format(expiresAt, 'dd/MM/yyyy HH:mm')}`
  );

  return JSON.stringify({
    createdAt,
    expiresAt,
    data,
  });
};

const to = <T = unknown[]>(
  key: string,
  data: T,
  createdAt: Date | null = null,
  expiration = 1440
) => {
  set(key, save(key, data, createdAt, expiration));
};

const Redis = {
  set,
  get,
  clear,
  reset,
  flush,
  from,
  to,
};

export default Redis;
