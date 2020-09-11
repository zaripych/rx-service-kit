import { InvalidExceptionError } from './invalidExceptionError';

export function ensureError(err?: unknown) {
  if (!err) {
    return new InvalidExceptionError(err);
  }

  return typeof err === 'object' && err instanceof Error
    ? err
    : new InvalidExceptionError(err);
}
