import { IPlayer } from "@/types/player";
import { CountryId } from "@core/types/country_id";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface AppStoreState {
  players: IPlayer[];
  lobby: {
    owner: boolean;
    online: boolean;
    id: string;
  }
  map: {
    width: number;
    height: number;
    seed: number;
  }
}

export interface AppStoreAction {

}

const initialState: AppStoreState = {
  players: [
    { id: "player", name: "Player", country: CountryId.Green, isAdmin: true },
    { id: "", name: "", country: CountryId.Purple },
    { id: "", name: "", country: CountryId.Red },
    { id: "", name: "", country: CountryId.Yellow },
  ],
  lobby: {
    owner: true,
    online: false,
    id: "abc123",
  },
  map: {
    width: 10,
    height: 10,
    seed: Date.now(),
  }
}

export const useAppStore = create(
  immer<AppStoreState & AppStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);
