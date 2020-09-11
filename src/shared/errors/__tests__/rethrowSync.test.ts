import { rethrowSync } from '../rethrowSync';
import { AggregateError } from '../aggregateError';

describe('rethrowSync', () => {
  it('works for non-throwing', () => {
    expect(
      rethrowSync(() => 1, err => err.withMessage('Something went wrong'))
    ).toEqual(1);

    expect(
      rethrowSync(() => false, err => err.withMessage('Something went wrong'))
    ).toEqual(false);
  });

  it('works for throwing', () => {
    expect(() =>
      rethrowSync(
        () => {
          throw new Error('Synchronous error');
        },
        err => err.withMessage('Something went wrong')
      )
    ).toThrowError(new AggregateError('Something went wrong'));
  });
});
