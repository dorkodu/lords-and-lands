import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@api/websocket/types";
import { useAppStore } from "@/stores/appStore";
import { useGameStore } from "@/stores/gameStore";
import { CountryId } from "@core/types/country_id";
import { game } from "@core/game";
import { createSeedRandom } from "@core/lib/seed_random";
import { createGameData } from "@core/gamedata";

export const socketio: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  { path: "/api/socket", transports: ["websocket"] }
);

// Default events \\
socketio.on("connect", () => {
  useAppStore.setState(s => { s.status = true });
});

socketio.on("connect_error", (_err) => {
  useAppStore.setState(s => { s.status = false });
});

socketio.on("disconnect", (_reason, _description) => {
  useAppStore.setState(s => { s.status = false });
});
// Default events \\

// Game events \\
socketio.on("server-create-lobby", (data) => {
  if (!data) return;

  useAppStore.setState(s => {
    s.lobby.playerId = data.playerId;
    s.lobby.lobbyId = data.lobbyId;
    s.lobby.adminId = data.playerId;

    s.lobby.players = [
      { id: data.playerId, name: data.playerName, country: CountryId.None }
    ];
  });

  useGameStore.setState(s => {
    s.data.width = data.w;
    s.data.height = data.h;
    s.data.seed = data.seed;
  });
});

socketio.on("server-join-lobby", (data) => {
  let joining = !useAppStore.getState().lobby.lobbyId;

  if (!joining) {
    useAppStore.setState(s => {
      s.lobby.players.push(...data?.players ?? []);
    });
  }
  else {
    useAppStore.setState(s => {
      s.lobby.players = data?.players ?? [];
      s.lobby.adminId = data?.adminId;
      s.lobby.online = true;

      s.lobby.playerId = data?.playerId;
      s.lobby.lobbyId = data?.lobbyId;

      // If successfully joined to the lobby, set redirect to "/lobby"
      if (data?.lobbyId) s.redirect = "/lobby";
    });

    useGameStore.setState(s => {
      if (data?.w !== undefined) s.data.width = data.w;
      if (data?.h !== undefined) s.data.height = data.h;
      if (data?.seed !== undefined) s.data.seed = data.seed;
    });
  }
});

socketio.on("server-leave-lobby", (data) => {
  if (!data) return;

  let needLobbyReset = false;

  const player = useAppStore.getState().lobby.players.filter(p => p.id === data.playerId)[0];

  useAppStore.setState(s => {
    // If current player left the lobby
    if (s.lobby.playerId === data.playerId) {
      needLobbyReset = true;
      s.redirect = "/";
    }
    // If another player left the lobby
    else {
      s.lobby.players = s.lobby.players.filter(p => p.id !== data.playerId);
    }
  });

  useGameStore.setState(s => {
    if (!player) return;
    game.play.removeCountry(s.data, { country: player.country });
  });

  if (needLobbyReset) useAppStore.getState().resetLobby();
});

socketio.on("server-lobby-update", (data) => {
  if (!data) return;

  // Lobby is made offline, reset lobby
  if (data.online !== undefined && !data.online) {
    useAppStore.getState().resetLobby();
    return;
  }

  const players = useAppStore.getState().lobby.players;

  useGameStore.setState(s => {
    if (data.w === undefined && data.h === undefined && data.seed === undefined) return;

    // Reset game data
    s.data = createGameData();

    // Set width, height & seed
    if (data.w !== undefined) s.data.width = data.w;
    if (data.h !== undefined) s.data.height = data.h;
    if (data.seed !== undefined) s.data.seed = data.seed;

    // Add countries of the current players in the lobby
    players.forEach(p => game.play.addCountry(s.data, { country: p.country }));

    // Generate
    game.play.generate(s.data, { w: s.data.width, h: s.data.height, seed: s.data.seed });
  });

  useAppStore.setState(s => {
    if (data.adminId) s.lobby.adminId = data.adminId;
  })
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

socketio.on("server-chat-message", (data) => {
  if (!data) return;

  const { id, msg } = data;
  useAppStore.setState(s => { s.lobby.messages.push({ playerId: id, msg: msg }) });
});

socketio.on("server-sync-state", (data) => {
  if (!data) return;
  useGameStore.setState(s => { s.data = game.serializer.deserialize(data.state) });
});

socketio.on("server-game-action", (data) => {
  if (!data) return;
  useGameStore.setState(s => {
    // Server sends a new seed on every action to prevent cheating
    s.data.rng = createSeedRandom(data.seed);
    game.parseAction(s.data, { id: data.id, info: data.info });
  });
});
// Game events \\