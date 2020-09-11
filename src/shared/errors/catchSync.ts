import { ensureError } from './ensureError';
import { Optional } from './types';
import { AggregateError } from './aggregateError';

export const catchSync = <O>(
  fn: () => O,
  opts: {
    errorMessage?: string;
  } = {}
): Optional<O> => {
  try {
    const result = fn();
    return {
      error: null,
      result,
    };
  } catch (err) {
    return {
      error: opts.errorMessage
        ? new AggregateError(opts.errorMessage, ensureError(err))
        : ensureError(err),
      result: null,
    };
  }
};
