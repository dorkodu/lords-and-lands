import { Server } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import { server } from "./server";

export const socketio = new Server<
  ClientToServerEvents,
  ServerToClientEvents
>(server);