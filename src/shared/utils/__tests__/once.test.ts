import { onceAsync } from '../once';

describe('onceAsync', () => {
  describe('when resolved', () => {
    it('should work', async () => {
      let value = 0;
      const fn = onceAsync(async () => {
        value += 1;
        return value;
      });

      expect(await fn()).toBe(1);
      expect(await fn()).toBe(1);
      expect(await fn()).toBe(1);
    });
  });

  describe('when not resolved', () => {
    it('should work', async () => {
      let value = 0;
      const fn = onceAsync(async () => {
        value += 1;
        throw new Error('ERROR');
      });

      await expect(fn()).rejects.toThrowError('ERROR');
      await expect(fn()).rejects.toThrowError('ERROR');
      await expect(fn()).rejects.toThrowError('ERROR');
      expect(value).toBe(3);
    });
  });
});
