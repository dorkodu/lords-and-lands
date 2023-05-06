import { game } from "@core/game";
import { crypto } from "../lib/crypto";
import { INetworkPlayer } from "../types/player";
import { IPlayer } from "../types/player";
import { dataAPI } from "./data";
import { changeCountrySchema, chatMessageSchema, createLobbySchema, gameActionSchema, joinLobbySchema, leaveLobbySchema, lobbyUpdateSchema, syncStateSchema } from "./schemas";
import { ClientToServerEvents } from "./types";

function createLobby(player: IPlayer, data: Parameters<ClientToServerEvents["client-create-lobby"]>[0]): void {
  const parsed = createLobbySchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-create-lobby", undefined);
  const parsedData = parsed.data;

  // Set player's name
  player.name = parsedData.playerName;

  // Try to create a lobby
  const lobby = dataAPI.createLobby(player);

  // Send the result to the player that tried to create a lobby
  if (!lobby) {
    player.socket?.emit("server-create-lobby", undefined);
  }
  else {
    const { width, height, seed } = lobby.gameData;
    player.socket?.emit(
      "server-create-lobby",
      { playerName: player.name, playerId: player.id, lobbyId: lobby.id, w: width, h: height, seed }
    );
  }
}

function joinLobby(player: IPlayer, data: Parameters<ClientToServerEvents["client-join-lobby"]>[0]): void {
  const parsed = joinLobbySchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-join-lobby", undefined);
  const parsedData = parsed.data;

  // Set player's name
  player.name = parsedData.playerName;

  const lobby = dataAPI.joinLobby(player, parsedData.lobbyId);

  if (!lobby) {
    // Send the joined player, that player couldn't join
    player.socket?.emit("server-join-lobby", undefined);
  }
  else {
    const players = Object.values(lobby.players);
    const networkPlayer: INetworkPlayer = { id: player.id, name: player.name, country: player.country }
    const networkPlayers = players.map(p => ({ id: p.id, name: p.name, country: p.country }));

    const { width, height, seed } = lobby.gameData;

    // Send the joined player: player id, lobby id, width, height, seed, and all players
    player.socket?.emit(
      "server-join-lobby",
      {
        playerId: player.id,
        lobbyId: lobby.id,
        adminId: lobby.adminId,
        w: width,
        h: height,
        seed,
        players: networkPlayers
      }
    );

    // Send the joined player sync state to syncronize game state because:
    // 1. Admin might have loaded a save
    // 2. Game might have already started
    player.socket?.emit("server-sync-state", { state: game.serializer.serialize(lobby.gameData) });

    // Send the already joined players, only the joined player
    players
      .filter(p => p.id !== player.id)
      .forEach(p => p.socket?.emit("server-join-lobby", { players: [networkPlayer] }));
  }
}

function leaveLobby(player: IPlayer, data: Parameters<ClientToServerEvents["client-leave-lobby"]>[0]): void {
  const parsed = leaveLobbySchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-leave-lobby", undefined);
  const parsedData = parsed.data;

  const lobby = dataAPI.getLobbyFromPlayerId(parsedData.playerId);
  if (!lobby) return;

  const playerId = parsedData.playerId;
  const isAdmin = player.id === lobby.adminId;

  // If not admin and trying to make someone else leave the lobby
  if (!isAdmin && player.id !== playerId) {
    player.socket?.emit("server-leave-lobby", undefined);
    return;
  }

  // Send "leave lobby" event to all players in the lobby
  dataAPI.getLobbyPlayers(player.lobby).forEach(p => p.socket?.emit("server-leave-lobby", { playerId }));

  // Make player leave the lobby
  dataAPI.leaveLobby(playerId);

  // If player that left was the admin, send update to players 
  if (isAdmin) {
    dataAPI.getLobbyPlayers(player.lobby).forEach(p => p.socket?.emit("server-lobby-update", { adminId: lobby.adminId }));
  }
}

function lobbyUpdate(player: IPlayer, data: Parameters<ClientToServerEvents["client-lobby-update"]>[0]): void {
  const parsed = lobbyUpdateSchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-lobby-update", undefined);
  const { w, h, seed, online } = parsed.data;

  const status = dataAPI.lobbyUpdate(player, w, h, seed);

  // If lobby is made offline, remove the lobby and all the players connected to the lobby
  if (status && online !== undefined && !online) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    dataAPI.removeLobby(player);
    players.forEach(p => p.socket?.emit("server-lobby-update", { online: false }));
    return;
  }

  // If "lobby update" is done successfully, send it to all players, if not, only send to current player
  if (status) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => { p.socket?.emit("server-lobby-update", { w, h, seed, online }) });
  }
  else {
    player.socket?.emit("server-lobby-update", undefined);
  }
}

function changeCountry(player: IPlayer, data: Parameters<ClientToServerEvents["client-change-country"]>[0]): void {
  const parsed = changeCountrySchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-change-country", undefined);
  const parsedData = parsed.data;

  const result = dataAPI.changeCountry(player, parsedData.country);

  // If "change country" is done successfully, send it to all players, if not, only send to current player
  if (result) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => p.socket?.emit("server-change-country", result));
  }
  else {
    player.socket?.emit("server-change-country", undefined);
  }
}

function chatMessage(player: IPlayer, data: Parameters<ClientToServerEvents["client-chat-message"]>[0]): void {
  const parsed = chatMessageSchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-chat-message", undefined);
  const parsedData = parsed.data;

  const players = dataAPI.getLobbyPlayers(player.lobby);
  players.forEach(p => p.socket?.emit("server-chat-message", { id: player.id, msg: parsedData.message }));
}

function syncState(player: IPlayer, data: Parameters<ClientToServerEvents["client-sync-state"]>[0]): void {
  const parsed = syncStateSchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-sync-state", undefined);
  const parsedData = parsed.data;

  const status = dataAPI.syncState(player, parsedData);

  if (status) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => p.socket?.emit("server-sync-state", { state: parsedData }));
  }
  else {
    player.socket?.emit("server-sync-state", undefined);
  }
}

function gameAction(player: IPlayer, data: Parameters<ClientToServerEvents["client-game-action"]>[0]): void {
  const parsed = gameActionSchema.safeParse(data);
  if (!parsed.success) return void player.socket?.emit("server-game-action", undefined);
  const parsedData = parsed.data;

  const seed = crypto.seed();
  const actable = dataAPI.gameAction(player, parsedData, seed);

  if (actable) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => p.socket?.emit("server-game-action", { id: parsedData.id, info: parsedData.info, seed }));
  }
  else {
    player.socket?.emit("server-game-action", undefined);
  }
}

export const websocketController = {
  createLobby,
  joinLobby,
  leaveLobby,
  lobbyUpdate,
  changeCountry,

  chatMessage,
  syncState,

  gameAction,
}