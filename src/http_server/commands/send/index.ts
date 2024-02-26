import ClientsController from '../ClientsController';

const sendCommands = (clientsController: ClientsController) =>
  ({
    reg(client: WebSocket, payload: unknown) {
      clientsController.sendToClient(client, {
        type: 'reg',
        data: payload,
      });
    },
    updateRoom(payload: unknown) {
      clientsController.sendToAll({
        type: 'update_room',
        data: payload,
      });
    },

    updateWinners(payload: unknown) {
      clientsController.sendToAll({
        type: 'update_winners',
        data: payload,
      });
    },

    createGame(usersIds: string[], payload: unknown) {
      clientsController.sendToRoom(usersIds, {
        type: 'create_game',
        data: payload,
      });
    },

    startGame(usersIds: string[], payload: unknown) {
      clientsController.sendToRoom(usersIds, {
        type: 'start_game',
        data: payload,
      });
    },
  } as const);

export default sendCommands;
