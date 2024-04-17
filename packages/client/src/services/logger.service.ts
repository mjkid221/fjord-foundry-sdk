export type LoggerLike = Pick<Console, 'debug' | 'error' | 'info' | 'log' | 'trace' | 'warn'>;

export const Logger = (name: string, enabled: boolean = false): LoggerLike => {
  if (!enabled) {
    return {
      debug: () => {},
      error: () => {},
      info: () => {},
      log: () => {},
      trace: () => {},
      warn: () => {},
    };
  }

  return console;
};

export const handleError = (logger: LoggerLike, message?: string) => (error: Error) => {
  logger.error(error.message);
  throw new Error(`Error Occurred: ${message ?? error.message}`);
};

export const handleDebug = (logger: LoggerLike, message?: string) => (res: any) => {
  logger.debug(message, res);
  return res;
};
