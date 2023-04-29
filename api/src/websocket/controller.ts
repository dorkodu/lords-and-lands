import { CountryId } from "@core/types/country_id";
import { socketio } from "../lib/socketio";
import { IPlayer } from "../types/player";
import { dataAPI } from "./data";
import { ClientToServerEvents } from "./types";

function createLobby(player: IPlayer) {
  const lobby = dataAPI.createLobby(player.id);
  socketio.emit("server-create-lobby", { lobbyId: lobby?.id });
}

function joinLobby(player: IPlayer, data: Parameters<ClientToServerEvents["client-join-lobby"]>[0]) {
  const players = dataAPI.joinLobby(player, data.lobbyId);
  socketio.emit("server-join-lobby", players);
}

function leaveLobby(player: IPlayer) {
  dataAPI.leaveLobby(player);
  socketio.emit("server-leave-lobby", { playerId: player.id });
}

function lobbyUpdate(player: IPlayer) {

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