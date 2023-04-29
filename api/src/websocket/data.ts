import { ILobby } from "../types/lobby"
import { IPlayer } from "../types/player";
import { ISocket } from "../types/socket";
import { crypto } from "../lib/crypto";
import { constants } from "../types/constants";
import { CountryId } from "@core/types/country_id";
import { createGameData } from "@core/gamedata";

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

function getLobbyPlayers(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return [];
  return Object.values(lobby.players);
}


function createLobby(userId: string) {
  const id = crypto.id();
  if (data.lobbies[id]) return undefined;

  data.lobbies[id] = { id, adminId: userId, players: {}, gameData: createGameData() };
  return data.lobbies[id];
}

function joinLobby(player: IPlayer, lobbyId: string): ILobby | undefined {
  const lobby = data.lobbies[lobbyId];
  if (!lobby) return undefined;

  // If lobby has less than "lobbyMaxPlayerCount"
  const playerCount = Object.values(lobby).length;
  if (playerCount >= constants.lobbyMaxPlayerCount) return undefined;

  lobby.players[player.id] = player;
  return lobby;
}

function leaveLobby(player: IPlayer) {
  const lobbyId = player.lobby;
  if (!lobbyId) return;

  delete data.lobbies[lobbyId]?.players[player.id];
}

function lobbyUpdate(player: IPlayer, width?: number, height?: number, seed?: number): boolean {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return false;

  // If not the admin, can't update lobby
  if (lobby.adminId !== player.id) return false;

  // If game is running, can't change
  if (lobby.gameData.running) return false;

  if (width !== undefined) lobby.gameData.width = width;
  if (height !== undefined) lobby.gameData.height = height;
  if (seed !== undefined) lobby.gameData.seed = seed;

  return true;
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

  // Check if any other player is using the same country
  let used = false;
  getLobbyPlayers(player).forEach(p => p.country === country && (used = true));
  if (used) return undefined;

  return { id: player.id, country };
}

export const dataAPI = {
  createPlayer,
  removePlayer,
  getLobbyPlayers,

  createLobby,
  joinLobby,
  leaveLobby,
  lobbyUpdate,
  changeCountry,
}

export const data = {
  lobbies: {} as Record<string, ILobby>,
  players: {} as Record<string, IPlayer>,
}