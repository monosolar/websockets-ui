import WebSocket from 'ws';
import { getPayloadByMessage } from '../utils';

class ClientsController {
  #usersByClients = new Map();

  // eslint-disable-next-line class-methods-use-this
  sendToClient = (client: WebSocket, payload: Record<string, unknown>) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(getPayloadByMessage(payload));
      console.info('--->', 'Message sent:', payload);
    }
  };

  sendToAll = (payload: Record<string, unknown>) => {
    Array.from(this.#usersByClients.keys()).forEach((client) => {
      this.sendToClient(client, payload);
    });
  };

  sendToRoom = (userIds: string[], payload: Record<string, any>) => {
    Array.from(this.#usersByClients.entries()).forEach(([client, userId]) => {
      if (userIds.includes(userId)) {
        let payloadToSend = payload;
        if (payload?.data?.idPlayer) {
          payloadToSend = {
            ...payload,
            data: { ...payload?.data, idPlayer: userId },
          };
        }
        this.sendToClient(client, payloadToSend);
      }
    });
  };

  setClientToUserId = (client: WebSocket, userId: string) => {
    this.#usersByClients.set(client, userId);
  };

  getUserIdByClient = (client: WebSocket) => this.#usersByClients.get(client);
}

export default ClientsController;
