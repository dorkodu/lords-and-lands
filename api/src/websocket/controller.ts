import { INetworkPlayer } from "../types/network_player";
import { IPlayer } from "../types/player";
import { dataAPI } from "./data";
import { ClientToServerEvents } from "./types";

function createLobby(player: IPlayer) {
  // Try to create a lobby
  const lobby = dataAPI.createLobby(player);

  // Send the result to the player that tried to create a lobby
  if (!lobby) {
    player.socket.emit("server-create-lobby", undefined);
  }
  else {
    const { width, height, seed } = lobby.gameData;
    player.socket.emit(
      "server-create-lobby",
      { playerId: player.id, lobbyId: lobby.id, w: width, h: height, seed }
    );
  }
}

function joinLobby(player: IPlayer, data: Parameters<ClientToServerEvents["client-join-lobby"]>[0]) {
  const lobby = dataAPI.joinLobby(player, data.lobbyId);

  if (!lobby) {
    // Send the joined player, that player couldn't join
    player.socket.emit("server-join-lobby", undefined);
  }
  else {
    const players = Object.values(lobby.players);
    const networkPlayer: INetworkPlayer = { id: player.id, name: player.name, country: player.country, isAdmin: dataAPI.isPlayerAdmin(player) }
    const networkPlayers: INetworkPlayer[] = players.map(p =>
      ({ id: p.id, name: p.name, country: p.country, isAdmin: dataAPI.isPlayerAdmin(p) })
    );

    const { width, height, seed } = lobby.gameData;

    // Send the joined player: player id, lobby id, width, height, seed, and all players
    player.socket.emit(
      "server-join-lobby",
      { playerId: player.id, lobbyId: lobby.id, w: width, h: height, seed, players: networkPlayers }
    );

    // Send the already joined players, only the joined player
    players
      .filter(p => p.id !== player.id)
      .forEach(p => p.socket.emit("server-join-lobby", { players: [networkPlayer] }));
  }
}

function leaveLobby(player: IPlayer) {
  // Send "leave lobby" event to all players in the lobby
  dataAPI.getLobbyPlayers(player.lobby).forEach(p => p.socket.emit("server-leave-lobby", { playerId: player.id }));

  // Make player leave the lobby
  dataAPI.leaveLobby(player);
}

function lobbyUpdate(player: IPlayer, data: Parameters<ClientToServerEvents["client-lobby-update"]>[0]) {
  const status = dataAPI.lobbyUpdate(player, data.w, data.h, data.seed);

  // If lobby is made offline, remove the lobby and all the players connected to the lobby
  if (data.online !== undefined && !data.online) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    dataAPI.removeLobby(player);
    players.forEach(p => p.socket.emit("server-lobby-update", { online: false }));
  }

  // If "lobby update" is done successfully, send it to all players, if not, only send to current player
  if (status) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => {
      p.socket.emit("server-lobby-update", { w: data.w, h: data.h, seed: data.seed, online: data.online });
    });
  }
  else {
    player.socket.emit("server-lobby-update", undefined);
  }
}

function changeCountry(player: IPlayer, data: Parameters<ClientToServerEvents["client-change-country"]>[0]) {
  const result = dataAPI.changeCountry(player, data.country);

  // If "change country" is done successfully, send it to all players, if not, only send to current player
  if (result) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => p.socket.emit("server-change-country", result));
  }
  else {
    player.socket.emit("server-change-country", undefined);
  }
}

function chatMessage(_player: IPlayer, _data: Parameters<ClientToServerEvents["client-chat-message"]>[0]) {

}

function syncState(_player: IPlayer) {

}

function gameAction(player: IPlayer, data: Parameters<ClientToServerEvents["client-game-action"]>[0]) {
  const actable = dataAPI.gameAction(player, data);

  if (actable) {
    const players = dataAPI.getLobbyPlayers(player.lobby);
    players.forEach(p => p.socket.emit("server-game-action", data));
  }
  else {
    player.socket.emit("server-game-action", undefined);
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