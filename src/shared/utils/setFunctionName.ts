import { plainProps } from './plainProps';

export function setFunctionName<F extends Function>(name: string, fn: F): F {
  const wrapper = {
    [name]: (...args: unknown[]) => {
      // eslint-disable-next-line
      return fn(...args);
    },
  };

  Object.assign(wrapper[name], plainProps(fn));

  return (wrapper[name] as unknown) as F;
}
