export const randomElement = <T>(arr: T[]) => {
  if (arr.length === 0) {
    throw new TypeError('Empty choice set');
  }
  return arr[Math.floor(Math.random() * arr.length)];
};

export const randomElementExcluding = <T>(input: T[], exclude: T[]) => {
  const excludeSet: Set<T> = new Set(exclude);
  return randomElement(input.filter(item => !excludeSet.has(item)));
};
