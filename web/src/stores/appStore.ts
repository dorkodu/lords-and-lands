import { createGameData } from "@core/gamedata";
import { CountryId } from "@core/types/country_id";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { useGameStore } from "./gameStore";
import { INetworkPlayer } from "@api/types/player";

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
  status: boolean;

  modals: {
    showTutorial: boolean;

    showLobbyOnline: boolean;
    showQuitLobby: boolean;

    showNextTurn: boolean;

    showPlayerStatus: boolean;

    showUpdateSW: boolean;
  }

  lobby: {
    lobbyId: string | undefined;
    playerId: string | undefined;
    adminId: string | undefined;

    online: boolean;

    players: INetworkPlayer[];

    messages: { playerId: string, msg: string }[];
    message: string;
    lastSeenMessage: number | undefined;
  }
}

export interface AppStoreAction {
  resetLobby: () => void;

  playerIdToPlayer: (playerId: string) => INetworkPlayer | undefined;
  playerIdToColor: (playerId: string) => string | undefined;

  showMessageIndicator: () => boolean;

  isLobbyOwner: () => boolean;
}

const initialState: AppStoreState = {
  redirect: undefined,
  route: "any",
  status: false,

  modals: {
    showTutorial: false,

    showLobbyOnline: false,
    showQuitLobby: false,

    showNextTurn: false,

    showPlayerStatus: false,

    showUpdateSW: false,
  },

  lobby: {
    lobbyId: undefined,
    playerId: "0000",
    adminId: "0000",

    online: false,

    players: [
      {
        id: "0000",
        name: "Player",
        country: CountryId.Green
      },
      {
        id: "1111",
        name: "",
        country: CountryId.Purple,
        bot: { difficulty: "easy" }
      },
      {
        id: "2222",
        name: "",
        country: CountryId.Red,
        bot: { difficulty: "easy" }
      },
      {
        id: "3333",
        name: "",
        country: CountryId.Yellow,
        bot: { difficulty: "easy" }
      },
    ],

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

    isLobbyOwner: () => {
      return get().lobby.playerId === get().lobby.adminId;
    }
  }))
);
