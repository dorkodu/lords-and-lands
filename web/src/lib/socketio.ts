import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@api/websocket/types";

export const socketio: Socket<ServerToClientEvents, ClientToServerEvents> = io();
socketio.emit("join-lobby", { id: "tet" }, (status) => { });