import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@api/websocket/types";
import { useAppStore } from "@/stores/appStore";

export const socketio: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  { path: "/api/socket", transports: ["websocket"] }
);

// Default events \\
socketio.on("connect", () => {
  console.log("connect");
});

socketio.on("connect_error", (_err) => {
  console.log("connect_error");
});

socketio.on("disconnect", (_reason, _description) => {
  console.log("disconnect");
});
// Default events \\

// Game events \\
socketio.on("server-create-lobby", (data) => {
  useAppStore.setState(s => {
    s.lobby.playerId = data?.playerId;
    s.lobby.lobbyId = data?.lobbyId;
  });
});

socketio.on("server-join-lobby", (data) => {
  console.log(data);
});

socketio.on("server-leave-lobby", (data) => {
  console.log(data);
});

socketio.on("server-lobby-update", (data) => {
  useAppStore.setState(s => {
    if (data?.w) s.lobby.map.width = data.w;
    if (data?.h) s.lobby.map.height = data.h;
    if (data?.seed) s.lobby.map.seed = data.seed;

    if (data && data.online !== undefined) {
      s.lobby.online = data.online;

      // If lobby is made offline
      if (!data.online) {
        s.lobby.lobbyId = undefined;
      }
    }
  })
});

socketio.on("server-change-country", (data) => {
  console.log(data);
});
// Game events \\