import { httpServer } from './http_server';
import WebSocket from 'ws';
import {
  getMessagePayload,
  getPayloadByMessage,
  getUuid,
} from './http_server/utils';
import DataModel from './http_server/model';

const HTTP_PORT_SERVER = 4000;
const HTTP_PORT_WS = 3000;

console.log(`Start static http server on the ${HTTP_PORT_SERVER} port!`);
httpServer.listen(HTTP_PORT_SERVER);

const wsServer = new WebSocket.Server({ port: HTTP_PORT_WS });

const collection = new DataModel();
const usersByClients = new Map();

const sendToClient = (client: WebSocket, payload) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(getPayloadByMessage(payload));
    console.info('--->', 'Message sent:', payload);
  }
};

const sendToAll = (payload) => {
  Array.from(usersByClients.keys()).forEach((client) => {
    sendToClient(client, payload);
  });
};

const sendToRoom = (userIds: string[], payload) => {
  Array.from(usersByClients.entries()).forEach(([client, userId]) => {
    if (userIds.includes(userId)) {
      sendToClient(client, payload);
    }
  });
};

wsServer.on('close', () => {
  console.error('Websocket connection closed. Reconnecting in %f seconds ...');
});
wsServer.on('error', (reason) =>
  console.error('Websocket error: ' + reason.toString()),
);

wsServer.on('connection', (client: WebSocket) => {
  console.log('New client connected');

  client.on('message', (data: any, isBinary: boolean) => {
    const message = isBinary ? data : data.toString();
    const payload = getMessagePayload(message);
    console.info('--->', 'Message received:', payload);
    switch (payload.type) {
      case 'reg': {
        const result = collection.getUser(payload.data);
        usersByClients.set(client, result.index);

        sendToClient(client, {
          type: 'reg',
          data: result,
        });

        sendToAll({
          type: 'update_room',
          data: collection.getRooms(),
        });

        sendToAll({
          type: 'update_winners',
          data: collection.getWinners(),
        });

        break;
      }
      case 'create_room': {
        const userId = usersByClients.get(client);
        collection.addRom(userId);

        sendToAll({
          type: 'update_room',
          data: collection.getRooms(),
        });

        break;
      }
      case 'add_user_to_room': {
        const userId = usersByClients.get(client);
        const roomId = payload?.data?.indexRoom;
        const room = collection.addUserToRoom(roomId, userId);
        const playersIds = room.players;
        if (room) {
          sendToRoom(playersIds, {
            type: 'create_game',
            data: {
              idGame: room.gameId,
              idPlayer: playersIds.find((playerId) => playerId !== userId),
            },
          });
        }

        break;
      }
    }
  });

  client.on('close', () => {
    console.log('Client disconnected');
  });
});
