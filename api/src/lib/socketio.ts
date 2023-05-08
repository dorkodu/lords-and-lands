import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { dataAPI } from "../websocket/data";
import { server } from "./server";
import { websocketController } from "../websocket/controller";
import { IPlayer } from "../types/player";
import controller from "../http/controller";
import pg from "./pg";
import cookie from "cookie";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server, { path: "/api/socket" });

socketio.on("connection", async (socket): Promise<void> => {
  // Only allow users that are logged in and have subscribed to play multiplayer
  const token = socket.request.headers.cookie && cookie.parse(socket.request.headers.cookie)["token"];
  if (!token) return void socket.disconnect(true);

  const authInfo = await controller.getAuthInfo(token);
  if (!authInfo) return void socket.disconnect(true);

  const [result0]: [{ subscribed: boolean }?] = await pg`SELECT subscribed FROM users WHERE id=${authInfo.userId}`;
  if (!result0) return void socket.disconnect(true);
  if (!result0.subscribed) return void socket.disconnect(true);

  // Only 1 player can connect per id
  const player = dataAPI.createPlayer(authInfo.userId, socket);
  if (!player) return void socket.disconnect(true);

  let didCleanup = false;

  socket.on("client-create-lobby", (data) => { websocketController.createLobby(player, data) });
  socket.on("client-join-lobby", (data) => { websocketController.joinLobby(player, data) });
  socket.on("client-leave-lobby", (data) => { websocketController.leaveLobby(player, data) });
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
  websocketController.leaveLobby(player, { playerId: player.id });
  dataAPI.removePlayer(player);
}