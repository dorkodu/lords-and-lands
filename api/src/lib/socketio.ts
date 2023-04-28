import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { dataAPI } from "./data";
import { server } from "./server";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server);

socketio.on("connection", (socket): void => {
  const player = dataAPI.createPlayer(socket);
  if (!player) return void socket.disconnect(true);
});