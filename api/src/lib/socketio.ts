import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { dataAPI } from "../websocket/data";
import { server } from "./server";
import { websocketController } from "../websocket/controller";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server, { path: "/api/socket" });

socketio.on("connection", (socket): void => {
  const player = dataAPI.createPlayer(socket);
  if (!player) return void socket.disconnect(true);

  socket.on("client-create-lobby", () => { websocketController.createLobby(player) });
  socket.on("client-join-lobby", (data) => { websocketController.joinLobby(player, data) });
  socket.on("client-leave-lobby", () => { websocketController.leaveLobby(player) });
  socket.on("client-lobby-update", (data) => { websocketController.lobbyUpdate(player, data) });
  socket.on("client-change-country", (data) => { websocketController.changeCountry(player, data) });

  socket.on("client-chat-message", (data) => { websocketController.chatMessage(player, data) });
  socket.on("client-sync-state", () => { websocketController.syncState(player) });

  socket.on("client-game-action", () => { websocketController.gameAction(player) });

  socket.on("disconnect", (_reason, _description) => { dataAPI.removePlayer(player) });
  socket.on("disconnecting", (_reason, _description) => { dataAPI.removePlayer(player) });
  socket.on("error", (_err) => { dataAPI.removePlayer(player) });
});