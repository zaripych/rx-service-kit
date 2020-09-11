export const areArraysEqual = (a?: string[], b?: string[]) =>
  (!a && !b) ||
  (Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, idx) => val === b[idx]));
