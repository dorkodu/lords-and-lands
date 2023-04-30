import { util } from "@/lib/util";
import { IPlayer } from "@/types/player";
import { createGameData } from "@core/gamedata";
import { CountryId } from "@core/types/country_id";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useGameStore } from "./gameStore";

export interface AppStoreState {
  redirect: string | undefined;
  route:
  "game" |
  "chat" |
  "join-lobby" |
  "lobby" |
  "lobby-preview" |
  "main-menu" |
  "settings" |
  "saves" |
  "any";

  lobby: {
    lobbyId: string | undefined;
    playerId: string | undefined;

    owner: boolean;
    online: boolean;

    players: IPlayer[];

    map: {
      width: number;
      height: number;
      seed: number;
    }

    messages: { playerId: string, msg: string }[];
    message: string;
    lastSeenMessage: number | undefined;
  }
}

export interface AppStoreAction {
  resetLobby: () => void;

  playerIdToPlayer: (playerId: string) => IPlayer | undefined;
  playerIdToColor: (playerId: string) => string | undefined;

  showMessageIndicator: () => boolean;
}

const initialState: AppStoreState = {
  redirect: undefined,
  route: "any",

  lobby: {
    lobbyId: undefined,
    playerId: undefined,

    owner: true,
    online: false,

    players: [
      { id: util.generateId(), name: "Player", country: CountryId.None, isAdmin: true },
    ],

    map: {
      width: 10,
      height: 10,
      seed: Date.now(),
    },

    messages: [],
    message: "",
    lastSeenMessage: undefined,
  },
}

export const useAppStore = create(
  immer<AppStoreState & AppStoreAction>((set, get) => ({
    ...initialState,

    resetLobby: () => {
      set(s => { s.lobby = { ...initialState.lobby } });
      useGameStore.setState(s => { s.data = createGameData() });
    },

    playerIdToPlayer: (playerId) => {
      const player = get().lobby.players.filter(p => p.id === playerId)[0];
      return player;
    },

    playerIdToColor: (playerId) => {
      const player = get().playerIdToPlayer(playerId);

      switch (player?.country) {
        case CountryId.Green: return "#37D98C";
        case CountryId.Purple: return "#9179FF";
        case CountryId.Red: return "#FC5C65";
        case CountryId.Yellow: return "#FFB600";
      }

      return undefined;
    },

    showMessageIndicator: () => {
      const seenIndex = get().lobby.lastSeenMessage;
      const lastIndex = get().lobby.messages.length - 1;
      if (lastIndex < 0) return false;
      return seenIndex === undefined || seenIndex !== lastIndex;
    },
  }))
);
