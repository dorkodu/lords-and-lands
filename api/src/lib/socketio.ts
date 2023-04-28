import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { dataAPI } from "../websocket/data";
import { server } from "./server";
import { websocketController } from "../websocket/controller";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server);

socketio.on("connection", (socket): void => {
  const player = dataAPI.createPlayer(socket);
  if (!player) return void socket.disconnect(true);

  socket.on("create-lobby", (data, cb) => { websocketController.createLobby(player) });
  socket.on("join-lobby", (data, cb) => { websocketController.joinLobby(player, [data, cb]) });
  socket.on("leave-lobby", () => { websocketController.leaveLobby(player) });
  socket.on("lobby-update", () => { websocketController.lobbyUpdate(player) });

  socket.on("join-slot", (data) => { websocketController.joinSlot(player, [data]) });
  socket.on("leave-slot", () => { websocketController.leaveLobby(player) });

  socket.on("chat-message", (data) => { websocketController.chatMessage(player, [data]) });
  socket.on("sync-state", () => { websocketController.syncState(player) });

  socket.on("game-action", () => { websocketController.gameAction(player) });
});