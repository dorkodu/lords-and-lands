import { IPlayer } from "../types/player";
import { ClientToServerEvents } from "./types";

function createLobby(player: IPlayer) {

}

function joinLobby(player: IPlayer, [data, cb]: Parameters<ClientToServerEvents["join-lobby"]>) {

}

function leaveLobby(player: IPlayer) {

}

function lobbyUpdate(player: IPlayer) {

}

function joinSlot(player: IPlayer, [data, cb]: Parameters<ClientToServerEvents["join-slot"]>) {

}

function leaveSlot(player: IPlayer) {

}

function chatMessage(player: IPlayer, [data, cb]: Parameters<ClientToServerEvents["chat-message"]>) {

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

  joinSlot,
  leaveSlot,

  chatMessage,
  syncState,

  gameAction,
}