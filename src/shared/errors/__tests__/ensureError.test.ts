import { ensureError } from '../ensureError';
import { InvalidExceptionError } from '../invalidExceptionError';
import { AggregateError } from '../aggregateError';

describe('ensureError', () => {
  describe('uses InvalidExceptionError', () => {
    it('which can be created', () => {
      [
        // @ts-expect-error
        new InvalidExceptionError(),
        new InvalidExceptionError(undefined),
        new InvalidExceptionError('Some value'),
        new InvalidExceptionError({}),
      ].forEach((item) => {
        expect(item).toBeInstanceOf(InvalidExceptionError);
      });
    });
  });

  it('works for unexpected', () => {
    expect(ensureError(undefined)).toBeInstanceOf(InvalidExceptionError);
    expect(ensureError(null)).toBeInstanceOf(InvalidExceptionError);
    expect(ensureError(0)).toBeInstanceOf(InvalidExceptionError);
    expect(ensureError({})).toBeInstanceOf(InvalidExceptionError);
    expect(ensureError('Error')).toBeInstanceOf(InvalidExceptionError);
  });

  it('works for errors', () => {
    const error = new Error();
    expect(ensureError(error)).toBe(error);
  });

  it('works for inherited errors', () => {
    const error = new AggregateError();
    expect(ensureError(error)).toBe(error);
  });
});
