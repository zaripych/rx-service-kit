import { setFunctionName } from '../setFunctionName';

describe('setFunctionName', () => {
  it('should work', () => {
    const fn = setFunctionName('uniqueName', () => {
      return 'something';
    });
    expect(fn.name).toBe('uniqueName');
    expect(fn()).toBe('something');
  });

  it('should keep behaviour', () => {
    const fn = setFunctionName('uniqueName', () => {
      throw new Error('Something');
    });
    expect(fn.name).toBe('uniqueName');
    expect(fn).toThrow('Something');
  });
});
