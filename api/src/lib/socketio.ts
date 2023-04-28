import { Server } from "socket.io";
import { server } from "./server";

export const socketio = new Server(server);