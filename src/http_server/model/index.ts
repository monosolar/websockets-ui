import { getIntRandom, /* getShipDecks,  */ getUuid } from '../utils';

class DataModel {
  #data = {
    users: {},
    rooms: {},
  };

  registerUser({ name, password }) {
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

  getUser({ name, password }) {
    const userId =
      Object.keys(this.#data.users).find(
        (itemUserId) => this.#data.users[itemUserId].name === name,
      ) || '';

    if (!userId) {
      return this.registerUser({ name, password });
    }

    const isPasswordMatch = password === this.#data.users[userId].password;
    if (isPasswordMatch) {
      return {
        name,
        password,
        index: userId,
        error: false,
        errorText: '',
      };
    }
    return {
      name: '',
      password: '',
      index: userId,
      error: true,
      errorText: "Password doesn't march",
    };
  }

  getWinners() {
    return (
      Object.values(this.#data.users) as { name: string; wins: number }[]
    ).map(({ name, wins }) => ({
      name,
      wins,
    }));
  }

  addRom(userId: string) {
    const uuid = getUuid();
    this.#data.rooms[uuid] = { players: [userId] };

    return uuid;
  }

  getRooms() {
    return Object.keys(this.#data.rooms).map((roomId) => ({
      roomId,
      roomUsers: this.#data.rooms[roomId].players.map((userId: string) => ({
        name: this.#data.users[userId].name,
        index: userId,
      })),
    }));
  }

  getRoom(roomId) {
    return this.#data.rooms[roomId];
  }

  addUserToRoom(roomId: string, userId: string) {
    if (this.#data.rooms[roomId]) {
      const currentRoomUsers = this.#data.rooms[roomId].players;

      if (!currentRoomUsers.includes(userId)) {
        this.#data.rooms[roomId].players.push(userId);
        return this.#data.rooms[roomId];
      }
    }

    return null;
  }

  createGame(roomId: string) {
    this.#data.rooms[roomId].game = {};

    return roomId;
  }

  addShips(roomId: string, userId: string, ships: unknown[]) {
    const { game } = this.#data.rooms[roomId];
    game[userId] = ships;

    game[userId].map((ship) => {
      // eslint-disable-next-line no-param-reassign
      //ship.decks = getShipDecks(ship);

      return ship;
    });

    const playersReady = Object.keys(game);

    if (playersReady.length === 2) {
      game.currentPlayer = playersReady[getIntRandom(2)];
    }

    return game;
  }

  attack(roomId: string, userId: string, x: number, y: number) {
    const { game } = this.#data.rooms[roomId];
    const ships = game[userId];
  }

  getData() {
    return this.#data;
  }
}

export default DataModel;
