import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { dataAPI } from "../websocket/data";
import { server } from "./server";
import { websocketController } from "../websocket/controller";
import { IPlayer } from "../types/player";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server, { path: "/api/socket" });

socketio.on("connection", (socket): void => {
  const player = dataAPI.createPlayer(socket);
  if (!player) return void socket.disconnect(true);

  let didCleanup = false;

  socket.on("client-create-lobby", (data) => { websocketController.createLobby(player, data) });
  socket.on("client-join-lobby", (data) => { websocketController.joinLobby(player, data) });
  socket.on("client-leave-lobby", () => { websocketController.leaveLobby(player) });
  socket.on("client-lobby-update", (data) => { websocketController.lobbyUpdate(player, data) });
  socket.on("client-change-country", (data) => { websocketController.changeCountry(player, data) });

  socket.on("client-chat-message", (data) => { websocketController.chatMessage(player, data) });
  socket.on("client-sync-state", (data) => { websocketController.syncState(player, data) });

  socket.on("client-game-action", (data) => { websocketController.gameAction(player, data) });

  socket.on("disconnect", (_reason, _description) => {
    if (didCleanup) return;
    didCleanup = true;
    cleanup(player);
  });
  socket.on("disconnecting", (_reason, _description) => {
    if (didCleanup) return;
    didCleanup = true;
    cleanup(player);
  });
  socket.on("error", (_err) => {
    if (didCleanup) return;
    didCleanup = true;
    cleanup(player);
  });
});

function cleanup(player: IPlayer) {
  websocketController.leaveLobby(player);
  dataAPI.removePlayer(player);
}