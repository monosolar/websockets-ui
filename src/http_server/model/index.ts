import { getUuid } from '../utils';

class DataModel {
  #data = {
    users: {},
    rooms: {},
  };

  constructor() {}

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
        (userId) => this.#data.users[userId].name === name,
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
    } else {
      return {
        name: '',
        password: '',
        index: userId,
        error: true,
        errorText: "Password doesn't march",
      };
    }
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

  addRom(player1Idx: string) {
    const uuid = getUuid();
    this.#data.rooms[uuid] = { players: [player1Idx] };

    return uuid;
  }

  getRooms() {
    return Object.keys(this.#data.rooms).map((roomId) => {
      return {
        roomId,
        roomUsers: this.#data.rooms[roomId].players.map((userId: string) => {
          return { name: this.#data.users[userId].name, index: userId };
        }),
      };
    });
  }

  addUserToRoom(roomId: string, userId: string) {
    if (this.#data.rooms[roomId]) {
      const currentRoomUsers = this.#data.rooms[roomId].players;

      if (!currentRoomUsers.includes(userId)) {
        this.#data.rooms[roomId].players.push(userId);
        this.#data.rooms[roomId].gameId = getUuid();
        return this.#data.rooms[roomId];
      }
    }

    return null;
  }
}

export default DataModel;
