import { catchSync } from '../catchSync';
import { AggregateError } from '../aggregateError';

describe('catchSync', () => {
  describe('given non-throwing fn', () => {
    it('should work for regular values', () => {
      expect(catchSync(() => true)).toEqual({
        error: null,
        result: true,
      });

      expect(catchSync(() => 1)).toEqual({
        error: null,
        result: 1,
      });

      const instance = {};
      const result = catchSync(() => instance);
      expect(result).toEqual({
        error: null,
        result: instance,
      });
      expect(result.result).toBe(instance);

      const fn = () => 1;
      expect(catchSync(() => fn)).toEqual({
        error: null,
        result: fn,
      });
      expect(fn()).toBe(1);

      expect(catchSync(() => new Error())).toEqual({
        error: null,
        result: new Error(),
      });

      expect(catchSync(() => Promise.resolve())).toEqual({
        error: null,
        result: Promise.resolve(),
      });
    });
  });

  describe('given throwing fns', () => {
    it('should return correct errors', () => {
      expect(
        catchSync(() => {
          throw new Error();
        })
      ).toEqual({
        error: new Error(),
        result: null,
      });

      expect(
        catchSync(() => {
          throw new AggregateError('Something went wrong', new Error());
        })
      ).toEqual({
        error: new AggregateError('Something went wrong', new Error()),
        result: null,
      });

      const instance = new Error();
      const result = catchSync(() => {
        throw instance;
      });
      expect(result).toEqual({
        error: instance,
        result: null,
      });
      expect(result.error).toBe(instance);
    });

    describe('given error message override', () => {
      it('should return aggregate error with that message', () => {
        expect(
          catchSync(
            () => {
              throw new Error('Oh, something went wrong');
            },
            {
              errorMessage: 'Top level override',
            }
          )
        ).toEqual({
          error: new AggregateError(
            'Top level override',
            new Error('Oh, something went wrong')
          ),
          result: null,
        });
      });
    });
  });
});
