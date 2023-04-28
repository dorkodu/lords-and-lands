import { io, Socket } from "socket.io-client";
import { ServerToClientEvents, ClientToServerEvents } from "@api/websocket/types";

export const socketio: Socket<ServerToClientEvents, ClientToServerEvents> = io();