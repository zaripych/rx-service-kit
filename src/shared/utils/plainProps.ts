export function plainProps<T extends object>(value: T): Partial<T> {
  return (Object.keys(value) as Array<keyof T>).reduce(
    (acc, key) => ({
      ...acc,
      [key]: value[key],
    }),
    {} as Partial<T>
  );
}
