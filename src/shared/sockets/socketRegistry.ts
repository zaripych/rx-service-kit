import WebSocket from 'ws';
import { Server, SocketHandler } from './types';
import { AnySocketEpic } from '../kit';
import { buildOnConnectionListener } from './buildOnConnectionListener';
import { IConnectedSocket, buildRegistryStateApi } from './socketRegistryState';
import { buildServerUpgradeListener } from './buildServerUpgradeListener';
import { BasicLogger } from '../logging';

export type SocketRegistry = ReturnType<typeof createSocketRegistry>;

export function createSocketRegistry(
  server: Server,
  epicsByPath: Map<string, AnySocketEpic>,
  logger: BasicLogger
) {
  const state = {
    epicsByPath,
    sockets: new Map<string, IConnectedSocket>(),
    logger,
  };

  const api = buildRegistryStateApi(state);

  const wss = new WebSocket.Server({ noServer: true });

  wss.on('error', error => {
    logger.log('💥  ', error);
  });

  const onConnection: SocketHandler = buildOnConnectionListener(
    () => state.epicsByPath,
    api.closeSocket,
    api.attachToSocket,
    logger
  );

  wss.on('connection', onConnection);

  const upgradeListener = buildServerUpgradeListener(
    wss,
    () => state.epicsByPath,
    api.addSocket,
    logger
  );

  server.addListener('upgrade', upgradeListener);

  return {
    initialize: (newEpicsByPath: Map<string, AnySocketEpic>) => {
      state.epicsByPath = newEpicsByPath;

      for (const socketState of state.sockets.values()) {
        onConnection(socketState.ws, socketState.request);
      }
    },
    deinitialize: async () => {
      for (const socketState of state.sockets.values()) {
        api.detachFromSocketInWatchMode(socketState.id);
      }
    },
    destroy: async () => {
      server.removeListener('upgrade', upgradeListener);

      await api.onServerClose();
    },
  };
}

export function getRegistry(
  server: Server & { registry?: SocketRegistry },
  epicsByPath: Map<string, AnySocketEpic>,
  logger: BasicLogger
) {
  if (server.registry) {
    return server.registry;
  }
  return (server.registry = createSocketRegistry(server, epicsByPath, logger));
}
