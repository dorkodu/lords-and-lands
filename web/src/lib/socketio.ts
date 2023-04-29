import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@api/websocket/types";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { CountryId } from "@core/types/country_id";
import { game } from "@core/game";
import { createSeedRandom } from "@core/lib/seed_random";

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
  if (!data) return;

  useAppStore.setState(s => {
    s.lobby.playerId = data.playerId;
    s.lobby.lobbyId = data.lobbyId;
    s.lobby.owner = true;

    s.lobby.players = [
      { id: data.playerId, name: data.playerId, country: CountryId.None, isAdmin: true }
    ];

    s.lobby.map.width = data.w;
    s.lobby.map.height = data.h;
    s.lobby.map.seed = data.seed;
  });

  useGameStore.setState(s => {
    s.data.width = data.w;
    s.data.height = data.h;
    s.data.seed = data.seed;
    s.data.rng = createSeedRandom(data.seed);
  });
});

socketio.on("server-join-lobby", (data) => {
  useAppStore.setState(s => {
    // If joining a lobby
    if (!s.lobby.lobbyId) {
      s.lobby.players = data?.players ?? [];
      s.lobby.owner = false;
      s.lobby.online = true;
    }
    // If already in a lobby but a new player is joining
    else {
      s.lobby.players.push(...data?.players ?? []);
      return;
    }

    s.lobby.playerId = data?.playerId;
    s.lobby.lobbyId = data?.lobbyId;

    if (data?.w !== undefined) s.lobby.map.width = data.w;
    if (data?.h !== undefined) s.lobby.map.height = data.h;
    if (data?.seed !== undefined) s.lobby.map.seed = data.seed;

    // If successfully joined to the lobby, set redirect to "/lobby"
    if (data?.lobbyId) s.redirect = "/lobby";
  });

  useGameStore.setState(s => {
    if (data?.w !== undefined) s.data.width = data.w;
    if (data?.h !== undefined) s.data.height = data.h;
    if (data?.seed !== undefined) {
      s.data.seed = data.seed;
      s.data.rng = createSeedRandom(data.seed);
    }
  });
});

socketio.on("server-leave-lobby", (data) => {
  let needLobbyReset = false;

  useAppStore.setState(s => {
    const player = s.lobby.players.filter(p => p.id === data.playerId)[0];

    // If current player left the lobby
    if (s.lobby.playerId === data.playerId) {
      needLobbyReset = true;
      s.redirect = "/";
    }
    // If another player left the lobby
    else {
      s.lobby.players = s.lobby.players.filter(p => p.id !== data.playerId);

      /**
       * TODO: In server when admin leaves, another player is chosen as admin,
       * but in client, if admin leaves, other players also leave automatically.
       */
      if (player && player.isAdmin) socketio.emit("client-leave-lobby");
    }
  });

  if (needLobbyReset) useAppStore.getState().resetLobby();
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
  });

  useGameStore.setState(s => {
    const { width, height, seed } = useAppStore.getState().lobby.map;
    s.data.rng = createSeedRandom(seed);
    game.play.generate(s.data, { w: width, h: height, seed });
  });
});

socketio.on("server-change-country", (data) => {
  if (!data) return;

  const player = useAppStore.getState().lobby.players.filter(p => p.id === data.id)[0];
  if (!player) return;

  const oldCountry = player.country;
  const newCountry = data.country;

  useAppStore.setState(s => {
    const p = s.lobby.players.filter(p => p.id === data.id)[0];
    if (p) p.country = newCountry;
  });

  useGameStore.setState(s => {
    game.play.removeCountry(s.data, { country: oldCountry });
    game.play.addCountry(s.data, { country: newCountry });
  });
});

socketio.on("server-chat-message", () => {

});

socketio.on("server-sync-state", () => {

});

socketio.on("server-game-action", (data) => {
  if (!data) return;
  useGameStore.setState(s => { game.parseAction(s.data, data) });
});
// Game events \\