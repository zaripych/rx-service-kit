import { rethrowAsync } from '../rethrowAsync';
import { AggregateError } from '../aggregateError';

describe('rethrowAsync', () => {
  it('works for non-throwing', async () => {
    await expect(
      rethrowAsync(() => 1, err => err.withMessage('Something went wrong'))
    ).resolves.toEqual(1);

    await expect(
      rethrowAsync(
        () => Promise.resolve(1),
        err => err.withMessage('Something went wrong')
      )
    ).resolves.toEqual(1);

    await expect(
      rethrowAsync(
        async () => false,
        err => err.withMessage('Something went wrong')
      )
    ).resolves.toEqual(false);
  });

  it('works for throwing', async () => {
    await expect(
      rethrowAsync(
        () => {
          throw new Error('Synchronous error');
        },
        err => err.withMessage('Something went wrong')
      )
    ).rejects.toEqual(new AggregateError('Something went wrong'));

    await expect(
      rethrowAsync(
        () => Promise.reject(1),
        err => err.withMessage('Something went wrong')
      )
    ).rejects.toEqual(new AggregateError('Something went wrong'));

    await expect(
      rethrowAsync(
        async () => {
          throw new Error('Invalid something');
        },
        err => err.withMessage('Something went wrong')
      )
    ).rejects.toEqual(new AggregateError('Something went wrong'));
  });
});
