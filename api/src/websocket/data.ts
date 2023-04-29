import { ILobby } from "../types/lobby"
import { IPlayer } from "../types/player";
import { ISocket } from "../types/socket";
import { crypto } from "../lib/crypto";
import { constants } from "../types/constants";
import { CountryId } from "@core/types/country_id";

function createPlayer(socket: ISocket) {
  const id = crypto.id();
  if (data.players[id]) return undefined;

  data.players[id] = { id, lobby: undefined, country: CountryId.None, socket };
  return data.players[id];
}

function removePlayer(id: string) {
  const player = data.players[id];
  const lobby = player && player.lobby && data.lobbies[player.lobby];

  if (!player) return;
  if (lobby) delete lobby.players[id];
  delete data.players[id];
}

function createLobby(userId: string) {
  const id = crypto.id();
  if (data.lobbies[id]) return undefined;

  data.lobbies[id] = { id, adminId: userId, players: {} };
  return data.lobbies[id];
}

function joinLobby(player: IPlayer, lobbyId: string): IPlayer[] {
  const lobby = data.lobbies[lobbyId];
  if (!lobby) return [];

  // If lobby has less than "lobbyMaxPlayerCount"
  const playerCount = Object.values(lobby).length;
  if (playerCount >= constants.lobbyMaxPlayerCount) return [];

  lobby.players[player.id] = player;
  return Object.values(lobby.players);
}

function leaveLobby(player: IPlayer) {
  const lobbyId = player.lobby;
  if (!lobbyId) return;

  delete data.lobbies[lobbyId]?.players[player.id];
}

function updateLobby(player: IPlayer) {

}

function changeCountry(player: IPlayer, countryStr: string): { id: string, country: CountryId } | undefined {
  let country = CountryId.None;

  switch (countryStr) {
    case "green": country = CountryId.Green; break;
    case "purple": country = CountryId.Purple; break;
    case "red": country = CountryId.Red; break;
    case "yellow": country = CountryId.Yellow; break;
    default: break;
  }

  return { id: player.id, country };
}

export const dataAPI = {
  createPlayer,
  removePlayer,

  createLobby,
  joinLobby,
  leaveLobby,
  updateLobby,
  changeCountry,
}

export const data = {
  lobbies: {} as Record<string, ILobby>,
  players: {} as Record<string, IPlayer>,
}