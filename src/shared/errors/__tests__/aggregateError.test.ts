import { AggregateError } from '../aggregateError';

describe('AggregateError', () => {
  it('can be created', () => {
    [
      new AggregateError(undefined),
      new AggregateError('Some string'),
      new AggregateError('Some string', new Error('Other error')),
    ].forEach((item) => {
      expect(item).toBeInstanceOf(AggregateError);
    });
  });

  it('contains inner exception messages', () => {
    const error = new AggregateError(
      'Top level message',
      new Error('Ooooh, something went wrong')
    );

    expect(error.toString()).toMatchInlineSnapshot(
      `"AggregateError: Top level message"`
    );
    expect(error.description.toString()).toMatchInlineSnapshot(`
      "AggregateError: Top level message
          Error: Ooooh, something went wrong
      "
    `);
  });

  it('contains inner exception messages for multiple inner errors', () => {
    const error = new AggregateError(
      'Top level message',
      new Error('Ooooh, something went wrong'),
      new AggregateError('Another aggregate here', new Error('And more'))
    );

    expect(error.toString()).toMatchInlineSnapshot(
      `"AggregateError: Top level message"`
    );
    expect(error.description.toString()).toMatchInlineSnapshot(`
      "AggregateError: Top level message
          Error: Ooooh, something went wrong
          AggregateError: Another aggregate here
              Error: And more
      "
    `);
  });
});
