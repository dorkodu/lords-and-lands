import { ILobby } from "../types/lobby"
import { IPlayer } from "../types/player";
import { ISocket } from "../types/socket";

function createPlayer(id: string, socket: ISocket) {
  if (!!data.players[id]) return undefined;
  data.players[id] = { id, lobby: undefined, socket };
  return data.players[id];
}

function removePlayer(id: string) {
  const player = data.players[id];
  const lobby = player && player.lobby && data.lobbies[player.lobby];

  if (!player) return;
  if (lobby) delete lobby.players[id];
  delete data.players[id];
}

export const dataAPI = {
  createPlayer,
  removePlayer,
}

export const data = {
  lobbies: {} as Record<string, ILobby>,
  players: {} as Record<string, IPlayer>,
}