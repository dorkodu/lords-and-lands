import { IPlayer } from "@/types/player";
import { CountryId } from "@core/types/country_id";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface AppStoreState {
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
    id: string;
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

}

const initialState: AppStoreState = {
  route: "any",

  lobby: {
    owner: true,
    online: false,
    id: "abc123",

    players: [
      { id: undefined, name: undefined, country: CountryId.Green },
      { id: undefined, name: undefined, country: CountryId.Purple },
      { id: undefined, name: undefined, country: CountryId.Red },
      { id: undefined, name: undefined, country: CountryId.Yellow },
    ],

    map: {
      width: 10,
      height: 10,
      seed: Date.now(),
    },
  },
}

export const useAppStore = create(
  immer<AppStoreState & AppStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);
