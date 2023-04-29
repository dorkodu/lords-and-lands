import { ILobby } from "../types/lobby"
import { IPlayer } from "../types/player";
import { ISocket } from "../types/socket";
import { crypto } from "../lib/crypto";
import { constants } from "../types/constants";
import { CountryId } from "@core/types/country_id";
import { createGameData } from "@core/gamedata";

function createPlayer(socket: ISocket) {
  // Generate random id, if player with id already exists, return
  const id = crypto.id();
  if (data.players[id]) return undefined;

  // Assign new player to data.players & return
  data.players[id] = { id, name: id, lobby: undefined, country: CountryId.None, socket };
  return data.players[id];
}

function removePlayer(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];

  // If removed player was the last player in the lobby, remove lobby
  if (lobby && Object.values(lobby.players).length === 1) removeLobby(player);

  // Delete player from players and from lobby.players if exists
  if (lobby) delete lobby.players[player.id];
  delete data.players[player.id];

  // If the removed player is admin, assign another player as admin
  if (lobby && lobby.adminId === player.id) {
    const newAdmin = Object.values(lobby.players)[0];
    if (newAdmin) lobby.adminId = newAdmin.id;
  }
}

function getLobbyPlayers(lobbyId: string | undefined) {
  const lobby = lobbyId && data.lobbies[lobbyId];
  if (!lobby) return [];
  return Object.values(lobby.players);
}

function isPlayerAdmin(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return undefined;
  return player.id === lobby.adminId;
}


function createLobby(player: IPlayer) {
  // If player is already in a lobby
  if (player.lobby) return undefined;

  // Generate id for lobby and check if it already exists
  const id = crypto.id();
  if (data.lobbies[id]) return undefined;

  // Assign player to lobby & lobby to player, then return the lobby
  data.lobbies[id] = { id, adminId: player.id, players: { [player.id]: player }, gameData: createGameData() };
  player.lobby = id;
  return data.lobbies[id];
}

function removeLobby(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return;

  const players = Object.values(lobby.players);

  // Remove lobby
  delete data.lobbies[lobby.id];

  // Remove players' lobby
  players.forEach(p => { p.lobby = undefined });
}

function joinLobby(player: IPlayer, lobbyId: string): ILobby | undefined {
  const lobby = data.lobbies[lobbyId];
  if (!lobby) return undefined;

  // If lobby has less than "lobbyMaxPlayerCount"
  const playerCount = Object.values(lobby.players).length;
  if (playerCount >= constants.lobbyMaxPlayerCount) return undefined;

  lobby.players[player.id] = player;
  player.lobby = lobbyId;

  return lobby;
}

function leaveLobby(player: IPlayer) {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return;

  // If removed player was the last player in the lobby, remove lobby
  if (lobby && Object.values(lobby.players).length === 1) removeLobby(player);

  // If the removed player is admin, assign another player as admin
  if (lobby && lobby.adminId === player.id) {
    const newAdmin = Object.values(lobby.players)[0];
    if (newAdmin) lobby.adminId = newAdmin.id;
  }

  delete data.lobbies[lobby.id]?.players[player.id];
}

function lobbyUpdate(player: IPlayer, width?: number, height?: number, seed?: number): boolean {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return false;

  // If not the admin, can't update lobby
  if (lobby.adminId !== player.id) return false;

  // If game is running, can't change width, height or seed
  if (lobby.gameData.running) return false;

  if (width !== undefined) lobby.gameData.width = width;
  if (height !== undefined) lobby.gameData.height = height;
  if (seed !== undefined) lobby.gameData.seed = seed;

  return true;
}

function changeCountry(player: IPlayer, countryStr: string): { id: string, country: CountryId } | undefined {
  const lobby = player.lobby && data.lobbies[player.lobby];
  if (!lobby) return undefined;

  // If game is running, can't change country
  if (lobby.gameData.running) return undefined;

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
  getLobbyPlayers(player.lobby).forEach(p => p.country === country && (used = true));
  if (used) return undefined;

  // Set the players country, and return
  player.country = country;
  return { id: player.id, country };
}

export const dataAPI = {
  createPlayer,
  removePlayer,
  getLobbyPlayers,
  isPlayerAdmin,

  createLobby,
  removeLobby,
  joinLobby,
  leaveLobby,
  lobbyUpdate,
  changeCountry,
}

export const data = {
  lobbies: {} as Record<string, ILobby>,
  players: {} as Record<string, IPlayer>,
}