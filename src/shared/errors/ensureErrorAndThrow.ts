import { ensureError } from './ensureError';

export const ensureErrorAndThrow = (err: unknown) => {
  throw ensureError(err);
};
