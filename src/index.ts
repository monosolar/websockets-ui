import WebSocket from 'ws';
import { httpServer } from './http_server';
import { getMessagePayload } from './http_server/utils';
import DataModel from './http_server/model';
import ClientsController from './http_server/commands/ClientsController';
import sendCommands from './http_server/commands/send';
import receiveCommands from './http_server/commands/receive';
//import { inspect } from 'util';

const HTTP_PORT_SERVER = 4000;
const HTTP_PORT_WS = 3000;

console.log(`Start static http server on the ${HTTP_PORT_SERVER} port!`);
httpServer.listen(HTTP_PORT_SERVER);

const wsServer = new WebSocket.Server({ port: HTTP_PORT_WS });

const collection = new DataModel();
const clientsController = new ClientsController();
const sends = sendCommands(clientsController);
const receives = receiveCommands(clientsController, sends, collection);

wsServer.on('close', () => {
  console.error('Websocket connection closed. Reconnecting in %f seconds ...');
});
wsServer.on('error', (reason) => {
  console.error(`Websocket error: ${reason.toString()}`);
});

wsServer.on('connection', (client: WebSocket) => {
  console.log('New client connected');

  client.on('message', (data: any, isBinary: boolean) => {
    const message = isBinary ? data : data.toString();
    const payload = getMessagePayload(message);
    console.info('--->', 'Message received:', payload);

    if (receives.hasOwnProperty(payload.type)) {
      receives[payload.type](client, payload);
    }

    /*     console.log(
      '--->',
      'collection',
      inspect(collection.getData(), {
        showHidden: false,
        depth: null,
        colors: true,
      }),
    ); */
  });
});
