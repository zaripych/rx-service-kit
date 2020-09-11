import url from 'url';
import { SocketHandler } from './types';
import { AnySocketEpic } from '../kit';
import { RegistryStateApi } from './socketRegistryState';
import { spinUpSocketEpic } from './spinUpSocketEpic';
import { BasicLogger } from '../logging';

export const buildOnConnectionListener = (
  epicsByPath: () => Map<string, AnySocketEpic>,
  closeSocket: RegistryStateApi['closeSocket'],
  attachToSocket: RegistryStateApi['attachToSocket'],
  logger: BasicLogger
): SocketHandler => (socket, message) => {
  if (!message.url) {
    return;
  }

  const pathname = url.parse(message.url).pathname;
  if (typeof pathname !== 'string') {
    return;
  }

  const epic = epicsByPath().get(pathname);
  if (!epic) {
    closeSocket(socket.id, 1000);
    return;
  }

  const { subscription, waitForCompletion } = spinUpSocketEpic(
    socket,
    message,
    epic,
    closeSocket,
    logger
  );

  attachToSocket(
    socket.id,
    subscription,
    waitForCompletion,
    epic.watchModeDetachBehaviour || 'disconnect'
  );
};
