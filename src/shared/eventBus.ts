import { Subject, Observable } from 'rxjs';
import { IAction } from './action';
import { share } from 'rxjs/operators';
import { tag } from 'rxjs-spy/operators';

const subject = new Subject<IAction>();

const sharedSubject = subject.asObservable().pipe(
  tag('event-bus'),
  share()
);

export function fromEventBus() {
  return sharedSubject;
}

export function pushToEventBus() {
  return (stream: Observable<IAction>) => {
    return new Observable<never>(subscriber => {
      subscriber.add(
        stream.subscribe({
          next: data => subject.next(data),
          error: err => subscriber.error(err),
          complete: () => subscriber.complete(),
        })
      );
    });
  };
}

export function publishToEventBus<T extends IAction>(action: T) {
  subject.next(action);
}
