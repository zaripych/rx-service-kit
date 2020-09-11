import { ensureError } from './ensureError';
import { AggregateError } from './aggregateError';
import { IRethrowInfo } from './types';

export const rethrowSync = <O>(
  fn: () => O,
  throwError: (info: IRethrowInfo) => Error | never
) => {
  try {
    return fn();
  } catch (err) {
    const error = ensureError(err);
    const newError = throwError({
      rethrow: () => new AggregateError(error.message, error),
      withMessage: (msg) => new AggregateError(msg, error),
      thrown: error,
      toString: () => `${String(error)}`,
    }) as Error | undefined;
    if (newError) {
      throw newError;
    }
    throw error;
  }
};
