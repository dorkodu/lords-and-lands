import { ClientToServerEvents, ServerToClientEvents } from "../websocket/types";
import type { Socket } from "socket.io";

export type ISocket = Socket<ClientToServerEvents, ServerToClientEvents, any, any>