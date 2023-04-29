import { socketio } from "../lib/socketio";
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
  // Make player leave the lobby
  dataAPI.leaveLobby(player);

  // Send "leave lobby" event to all players in the lobby (except player that left)
  dataAPI.getLobbyPlayers(player).forEach(p => p.socket.emit("server-leave-lobby", { playerId: player.id }));
}

function lobbyUpdate(player: IPlayer, data: Parameters<ClientToServerEvents["client-lobby-update"]>[0]) {
  const status = dataAPI.lobbyUpdate(player, data.width, data.height, data.seed);

  // If lobby update is done successfully, send it to other players, if not, don't do anything
  if (status) {

  }
}

function changeCountry(player: IPlayer, data: Parameters<ClientToServerEvents["client-change-country"]>[0]) {
  const result = dataAPI.changeCountry(player, data.country);
  socketio.emit("server-change-country", result);
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