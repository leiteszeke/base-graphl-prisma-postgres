import pino, { LogFn } from 'pino';
import fs from 'fs';
import path from 'path';
import pinoms from 'pino-multi-stream';

const moreOptions = (level?: pino.Level) => {
  if (!level) {
    return {};
  }

  return {
    ignore: 'level,pid,hostname',
    messageFormat: (log: pino.LogDescriptor, messageKey: string) =>
      `${log[messageKey]}`,
  };
};

const prettyStream = (level?: pino.Level): pino.DestinationStream => {
  const config: pinoms.PrettyStreamOptions = {
    prettyPrint: {
      colorize: level ? false : true,
      levelFirst: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      ...moreOptions(level),
    },
  };

  if (level) {
    config.dest = fs.createWriteStream(
      path.join(__dirname, '../../logs', `${level}.log`),
      {
        flags: 'a+',
      }
    );
  }

  return pinoms.prettyStream(config);
};

const streams: pino.StreamEntry[] | pino.DestinationStream[] =
  process.env.NODE_ENV !== 'local'
    ? [
        { level: 'debug', stream: prettyStream('debug') },
        { level: 'error', stream: prettyStream('error') },
        { level: 'info', stream: prettyStream('info') },
      ]
    : [{ stream: prettyStream() }];

const pinoLogger = pinoms(pinoms.multistream(streams) as pino.LoggerOptions);

const parseLog = (...args: Parameters<LogFn>): Parameters<LogFn> => {
  if (args.length <= 1) {
    return args;
  }

  const [message, object, ...rest] = args;

  if (typeof message === 'string') {
    return [object, message, ...rest];
  }

  return [message, object, ...rest];
};

const logger = {
  info: (...args: Parameters<LogFn>) => pinoLogger.info(...parseLog(...args)),
  debug: (...args: Parameters<LogFn>) => pinoLogger.debug(...parseLog(...args)),
  warn: (...args: Parameters<LogFn>) => pinoLogger.warn(...parseLog(...args)),
  error: (...args: Parameters<LogFn>) => pinoLogger.error(...parseLog(...args)),
};

export default logger;
