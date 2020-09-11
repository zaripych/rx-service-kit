import { Observable, timer, from } from 'rxjs';
import { catchError, switchMapTo, tap } from 'rxjs/operators';
import { registerError } from './registerError';
import { BasicLogger, defaultBasicLogger } from './logging';

interface IErrorInfo {
  error: Error;
  numberOfErrors: number;
  timeBeforeNextRetry: number;
}

export type RetryOpts = Partial<IRetryOptsAll>;

interface IRetryOptsAll {
  shouldRetry: (info: IErrorInfo) => boolean;
  sourceDescription: string;
  resetErrorsOnNext: boolean;
  waitTimeOnBackoff: number;
  waitTimeOnFirstError: number;
  minWaitTime: number;
  maxWaitTime: number;
  logger?: BasicLogger;
}

function timeBeforeNextRetry(opts: IRetryOptsAll, numberOfErrors: number) {
  return (
    opts.minWaitTime +
    (numberOfErrors === 1
      ? opts.waitTimeOnFirstError
      : Math.min(opts.waitTimeOnBackoff * numberOfErrors, opts.maxWaitTime))
  );
}

export function retryWithBackoff<T>(optsRaw?: RetryOpts) {
  const opts: IRetryOptsAll = {
    shouldRetry: _info => {
      return true;
    },
    resetErrorsOnNext: true,
    waitTimeOnFirstError: 1 * 1000,
    waitTimeOnBackoff: 5 * 1000,
    minWaitTime: 1,
    maxWaitTime: 1 * 60 * 60 * 1000,
    sourceDescription: 'process',
    ...optsRaw,
  };

  const logger = opts.logger ?? defaultBasicLogger();

  const log = (info: IErrorInfo) => {
    logger.error(
      `💥  The ${opts.sourceDescription || 'process'} has failed ${
        info.numberOfErrors
      } time(s). Will retry in ${(info.timeBeforeNextRetry / 1000).toFixed(
        2
      )}s. `,
      info.error
    );
  };

  const recursiveObserve = (
    errors: number,
    source: Observable<T>
  ): Observable<T> => {
    let reset = false;
    return source.pipe(
      stream =>
        opts.resetErrorsOnNext
          ? stream.pipe(
              tap(() => {
                // if we got at least one element consider this a success
                reset = true;
              })
            )
          : stream,
      catchError((error: Error) => {
        registerError(error);
        const numberOfErrors = reset ? 0 : errors;
        const time = timeBeforeNextRetry(opts, numberOfErrors + 1);
        const info = {
          error,
          numberOfErrors: numberOfErrors + 1,
          timeBeforeNextRetry: time,
        };
        log(info);
        return opts.shouldRetry(info)
          ? timer(time).pipe(
              switchMapTo(recursiveObserve(numberOfErrors + 1, source))
            )
          : from(Promise.reject(error));
      })
    );
  };

  return (source: Observable<T>) => recursiveObserve(0, source);
}
