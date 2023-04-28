import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { crypto } from "./crypto";
import { dataAPI } from "./data";
import { server } from "./server";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server);

socketio.on("connection", (socket): void => {
  const playerId = crypto.id();
  const player = dataAPI.createPlayer(playerId, socket);
  if (!player) return void socket.disconnect(true);
});