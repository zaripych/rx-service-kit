export class InvalidExceptionError extends Error {
  public readonly original?: unknown;

  constructor(original: unknown) {
    super(`A non-Error was thrown (${String(original)})`);
    this.name = 'InvalidExceptionError';
    this.original = original;
  }
}
