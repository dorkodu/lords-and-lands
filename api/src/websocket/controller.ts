import { IPlayer } from "../types/player";
import { dataAPI } from "./data";
import { ClientToServerEvents } from "./types";

function createLobby(player: IPlayer) {
  // Try to create a lobby
  const lobby = dataAPI.createLobby(player.id);

  // Send the result to the player that tried to create a lobby
  player.socket.emit("server-create-lobby", { lobbyId: lobby?.id });
}

function joinLobby(player: IPlayer, data: Parameters<ClientToServerEvents["client-join-lobby"]>[0]) {
  const lobby = dataAPI.joinLobby(player, data.lobbyId);


  if (!lobby) {
    // Send the joined player, that player couldn't join
    player.socket.emit("server-join-lobby", { players: undefined });
  }
  else {
    const players = Object.values(lobby.players);

    // Send the joined player, all players
    player.socket.emit("server-join-lobby", { players });

    // Send the already joined players, only the joined player
    players
      .filter(p => p.id !== player.id)
      .forEach(p => p.socket.emit("server-join-lobby", { players: [player] }));
  }
}

function leaveLobby(player: IPlayer) {
  // Send "leave lobby" event to all players in the lobby
  dataAPI.getLobbyPlayers(player).forEach(p => p.socket.emit("server-leave-lobby", { playerId: player.id }));

  // Make player leave the lobby
  dataAPI.leaveLobby(player);
}

function lobbyUpdate(player: IPlayer, data: Parameters<ClientToServerEvents["client-lobby-update"]>[0]) {
  const status = dataAPI.lobbyUpdate(player, data.w, data.h, data.seed);

  // If "lobby update" is done successfully, send it to all players, if not, only send to current player
  if (status) {
    const players = dataAPI.getLobbyPlayers(player);
    players.forEach(p => p.socket.emit("server-lobby-update", data));
  }
  else {
    player.socket.emit("server-lobby-update", undefined);
  }
}

function changeCountry(player: IPlayer, data: Parameters<ClientToServerEvents["client-change-country"]>[0]) {
  const result = dataAPI.changeCountry(player, data.country);

  // If "change country" is done successfully, send it to all players, if not, only send to current player
  if (result) {
    const players = dataAPI.getLobbyPlayers(player);
    players.forEach(p => p.socket.emit("server-change-country", result));
  }
  else {
    player.socket.emit("server-change-country", undefined);
  }
}

function chatMessage(player: IPlayer, data: Parameters<ClientToServerEvents["client-chat-message"]>[0]) {

}

function syncState(player: IPlayer) {

}

function gameAction(player: IPlayer) {

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