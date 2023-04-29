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
  }
}

export interface AppStoreAction {
  resetLobby: () => void;
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
  },
}

export const useAppStore = create(
  immer<AppStoreState & AppStoreAction>((set, _get) => ({
    ...initialState,

    resetLobby: () => {
      set(s => { s.lobby = { ...initialState.lobby } });
      useGameStore.setState(s => { s.data = createGameData() });
    },
  }))
);
