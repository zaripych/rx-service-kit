import { Observable, isObservable, merge, ObservedValueOf } from 'rxjs';
import { publishStream } from './publishStream';
import { registerError } from './registerError';
import { defaultBasicLogger, BasicLogger } from './logging';

export type TagNotification =
  | 'next'
  | 'error'
  | 'complete'
  | 'subscribe'
  | 'unsubscribe';

export type NotificationInfo<T, K = void> =
  | {
      notification: 'next';
      value: T;
    }
  | {
      notification: 'error';
      error: unknown;
    }
  | {
      notification: 'complete';
      lastValue?: T;
    }
  | {
      notification: 'subscribe';
    }
  | {
      notification: 'unsubscribe';
      lastValue?: T;
    }
  | {
      notification: K;
      lastValue?: T;
    };

export function executeOnNotifications<T, O extends Observable<unknown>>(
  notifications: Array<TagNotification | O>,
  cb: (info: NotificationInfo<T, ObservedValueOf<O>>) => void,
  logger: BasicLogger = defaultBasicLogger()
) {
  return <X extends T>(stream: Observable<X>) => {
    if (notifications.length === 0) {
      return stream;
    }

    return new Observable<X>((subscriber) => {
      const observables = notifications.filter(isObservable) as O[];

      if (notifications.includes('subscribe')) {
        cb({ notification: 'subscribe' });
      }

      const shared = publishStream(stream);

      let lastValue: X | undefined;

      subscriber.add(
        shared.subscribe({
          next: (value) => {
            lastValue = value;
          },
          error: (_err) => {
            // we can simply ignore the error because it
            // goes to the subscriber below anyway, however,
            // we cannot remove this handler otherwise the
            // error bubbles up to the process.onUnhandled
            return;
          },
          ...(notifications.includes('next') && {
            next: (value) => {
              lastValue = value;
              cb({ notification: 'next', value });
            },
          }),
          ...(notifications.includes('complete') && {
            complete: () => cb({ notification: 'complete', lastValue }),
          }),
          ...(notifications.includes('error') && {
            error: (error: unknown) => cb({ notification: 'error', error }),
          }),
        })
      );

      if (observables.length > 0) {
        subscriber.add(
          merge(...observables).subscribe({
            next: (notification: ObservedValueOf<O>) => {
              cb({ notification, lastValue });
            },
            error: (err) => {
              registerError(err);
              logger.log('💥  Logging notifications generated an error', err);
            },
          })
        );
      }

      subscriber.add(shared.subscribe(subscriber));

      subscriber.add(shared.connect());

      if (notifications.includes('unsubscribe')) {
        subscriber.add(() => {
          cb({ notification: 'unsubscribe', lastValue });
        });
      }
    });
  };
}
