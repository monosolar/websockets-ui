import { httpServer } from './http_server';
import WebSocket from 'ws';
import {
  getMessagePayload,
  getPayloadByMessage,
  getUuid,
} from './http_server/utils';

const HTTP_PORT_SERVER = 4000;
const HTTP_PORT_WS = 3000;

console.log(`Start static http server on the ${HTTP_PORT_SERVER} port!`);
httpServer.listen(HTTP_PORT_SERVER);

const wsServer = new WebSocket.Server({ port: HTTP_PORT_WS });

class Collection {
  #data;

  constructor() {
    this.#data = {
      users: {},
      rooms: {},
    };
  }

  userLogin({ name, password }) {
    const uuid = getUuid();
    this.#data.users[uuid] = { name, password, wins: 0 };

    return {
      name,
      password,
      index: uuid,
      error: false,
      errorText: '',
    };
  }

  addRom(player1Idx) {
    const uuid = getUuid();
    this.#data.rooms[uuid] = { players: [player1Idx] };

    return uuid;
  }

  getWinners() {
    return (
      Object.values(this.#data.users) as { name: string; wins: number }[]
    ).map(({ name, wins }) => {
      return {
        name,
        wins,
      };
    });
  }

  getRooms() {
    return Object.keys(this.#data.rooms).map((roomId) => {
      return {
        roomId,
        roomUsers: this.#data.rooms[roomId].players.map((userId) => {
          return { name: this.#data.users[userId].name, index: userId };
        }),
      };
    });
  }

  addUserToRoom(roomId: number, userId: number) {
    if (this.#data.rooms[roomId]) {
      const currentRoomUsers = this.#data.rooms[roomId].players;

      if (!currentRoomUsers.includes(userId)) {
        this.#data.rooms[roomId].players.push(userId);
      }
    }
  }
}

const collection = new Collection();
const usersByClients = new Map();

const sendToClient = (client: WebSocket, payload) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(getPayloadByMessage(payload));
    console.log('--->', 'Message sent:', payload);
  }
};

const sendToAll = (payload) => {
  Array.from(usersByClients.keys()).forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(getPayloadByMessage(payload));
      console.log('--->', 'Message sent:', payload);
    }
  });
};

wsServer.on('upgrade', async function upgrade(request, socket, head) {
  wsServer.handleUpgrade(request, socket, head, function done(client) {
    console.log('--->', 'client');
    wsServer.emit('connection', client, request);
  });
});

wsServer.on('connection', (client: WebSocket) => {
  console.log('New client connected');

  client.on('message', (data: any, isBinary: boolean) => {
    const message = isBinary ? data : data.toString();
    const payload = getMessagePayload(message);
    console.log('--->', 'Message received:', payload);
    switch (payload.type) {
      case 'reg': {
        const result = collection.userLogin(payload.data);
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

        collection.addUserToRoom(roomId, userId);

        break;
      }
    }
  });

  client.on('close', () => {
    console.log('Client disconnected');
  });
});
