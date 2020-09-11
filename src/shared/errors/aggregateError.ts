const innerErrorsToMessage = (pad: string, ...errors: Error[]) => {
  return errors.reduce((acc, val) => {
    const valStr =
      val instanceof AggregateError
        ? val.description.trim()
        : `${String(val)}`.trim();
    return acc + `${pad}${valStr}`.replace('\n', `\n${pad}`) + '\n';
  }, '');
};

export class AggregateError extends Error {
  public readonly description: string;
  public readonly innerErrors: Error[];

  constructor(message?: string, ...innerErrors: Error[]) {
    super(message);
    this.name = 'AggregateError';
    this.innerErrors = innerErrors;
    this.description = [
      'AggregateError',
      [message, `\n${innerErrorsToMessage('    ', ...innerErrors)}`]
        .filter(Boolean)
        .join(''),
    ]
      .filter(Boolean)
      .join(': ');
  }
}
