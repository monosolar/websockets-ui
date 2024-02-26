import DataModel from '../../model';
import ClientsController from '../ClientsController';
import sendCommands from '../send';

const receiveCommands = (
  clientsController: ClientsController,
  sends: ReturnType<typeof sendCommands>,
  collection: DataModel,
) => ({
  reg(client: WebSocket, { data }) {
    const result = collection.getUser(data);
    clientsController.setClientToUserId(client, result.index);
    sends.reg(client, result);
    sends.updateRoom(collection.getRooms());
    sends.updateWinners(collection.getWinners());
  },
  ['create_room']: (client: WebSocket) => {
    const userId = clientsController.getUserIdByClient(client);
    collection.addRom(userId);

    sends.updateRoom(collection.getRooms());
  },

  ['add_user_to_room']: (client: WebSocket, { data }) => {
    const userId = clientsController.getUserIdByClient(client);
    const roomId = data?.indexRoom;
    const room = collection.addUserToRoom(roomId, userId);
    const { players } = room;

    if (players.length === 2) {
      collection.createGame(roomId);

      sends.createGame(players, {
        idGame: roomId,
        idPlayer: 'to replace',
      });
    }
  },
  ['add_ships']: (_: unknown, { data }) => {
    const { gameId: roomId, indexPlayer: userId, ships } = data || {};
    const room = collection.getRoom(roomId);
    const { players } = room;
    const game = collection.addShips(roomId, userId, ships);

    if (game.currentPlayer) {
      sends.startGame(players, {
        ships: game[userId],
        currentPlayerIndex: userId,
      });
    }
  },
  attack: (_: unknown, { data }) => {
    const { gameId: roomId, indexPlayer: userId, x, y } = data || {};

    collection.attack(roomId, userId, x, y);
  },
});

export default receiveCommands;
