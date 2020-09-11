import { catchAsync } from '../catchAsync';
import { AggregateError } from '../aggregateError';
import { InvalidExceptionError } from '../invalidExceptionError';

describe('catchAsync', () => {
  describe('given non-throwing synchronous fn', () => {
    it('should work for regular values', async () => {
      await expect(catchAsync(() => true)).resolves.toEqual({
        error: null,
        result: true,
      });

      await expect(catchAsync(() => 1)).resolves.toEqual({
        error: null,
        result: 1,
      });

      const instance = {};
      const result = await catchAsync(() => instance);
      expect(result).toEqual({
        error: null,
        result: instance,
      });
      expect(result.result).toBe(instance);

      const fn = () => 1;
      await expect(catchAsync(() => fn)).resolves.toEqual({
        error: null,
        result: fn,
      });
      expect(fn()).toBe(1);

      await expect(catchAsync(() => new Error())).resolves.toEqual({
        error: null,
        result: new Error(),
      });
    });
  });

  describe('given non-throwing asynchronous fn', () => {
    it('should work for regular values', async () => {
      await expect(catchAsync(async () => true)).resolves.toEqual({
        error: null,
        result: true,
      });

      await expect(catchAsync(() => Promise.resolve(1))).resolves.toEqual({
        error: null,
        result: 1,
      });

      const instance = {};
      const result = await catchAsync(async () => instance);
      expect(result).toEqual({
        error: null,
        result: instance,
      });
      expect(result.result).toBe(instance);

      const fn = () => 1;
      await expect(catchAsync(() => Promise.resolve(fn))).resolves.toEqual({
        error: null,
        result: fn,
      });
      expect(fn()).toBe(1);

      await expect(
        catchAsync(() => Promise.resolve(new Error()))
      ).resolves.toEqual({
        error: null,
        result: new Error(),
      });
    });
  });

  describe('given throwing synchronous fns', () => {
    it('should resolve with errors', async () => {
      expect(
        await catchAsync(
          () => {
            // eslint-disable-next-line
            throw null;
          },
          {
            errorMessage: 'Overriden error message',
          }
        )
      ).toEqual({
        error: new AggregateError('Overriden error message'),
        result: null,
      });

      expect(
        await catchAsync(() => {
          // eslint-disable-next-line
          throw null;
        })
      ).toEqual({
        error: new InvalidExceptionError(null),
        result: null,
      });

      await expect(
        catchAsync(() => {
          throw new Error();
        })
      ).resolves.toEqual({
        error: new Error(),
        result: null,
      });

      await expect(
        catchAsync(() => {
          throw new AggregateError('Something went wrong', new Error());
        })
      ).resolves.toEqual({
        error: new AggregateError('Something went wrong', new Error()),
        result: null,
      });

      const instance = new Error();
      const result = await catchAsync(() => {
        throw instance;
      });
      expect(result).toEqual({
        error: instance,
        result: null,
      });
      expect(result.error).toBe(instance);
    });
  });

  describe('given throwing asynchronous fns', () => {
    it('should resolve with errors', async () => {
      await expect(
        catchAsync(async () => {
          throw new Error();
        })
      ).resolves.toEqual({
        error: new Error(),
        result: null,
      });

      await expect(
        catchAsync(async () => {
          throw new AggregateError('Something went wrong', new Error());
        })
      ).resolves.toEqual({
        error: new AggregateError('Something went wrong', new Error()),
        result: null,
      });

      await expect(
        catchAsync(async () => {
          return Promise.reject(
            new AggregateError('Something went wrong', new Error())
          );
        })
      ).resolves.toEqual({
        error: new AggregateError('Something went wrong', new Error()),
        result: null,
      });

      const instance = new Error();
      const result = await catchAsync(async () => {
        throw instance;
      });
      expect(result).toEqual({
        error: instance,
        result: null,
      });
      expect(result.error).toBe(instance);
    });
  });
});
