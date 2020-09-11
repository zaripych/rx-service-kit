import { defaultLogger } from './logging';

export const registerError = (error: unknown) => {
  defaultLogger.error(error);
};
