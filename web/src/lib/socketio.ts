import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@api/websocket/types";

export const socketio: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  { path: "/api/socket", transports: ["websocket"] }
);

// Default events \\
socketio.on("connect", () => {
  console.log("connect")
});

socketio.on("connect_error", (_err) => {
  console.log("connect_error")
});

socketio.on("disconnect", (_reason, _description) => {
  console.log("disconnect")
});
// Default events \\

// Game events \\
socketio.on("server-create-lobby", (data) => {

});

socketio.on("server-join-lobby", (data) => {

});

socketio.on("server-leave-lobby", (data) => {

});

socketio.on("server-lobby-update", (data) => {

});

socketio.on("server-change-country", (data) => {

});
// Game events \\