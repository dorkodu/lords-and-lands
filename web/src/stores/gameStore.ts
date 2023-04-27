import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { game } from "@core/game";
import { IGameData } from "@core/gamedata";
import { CountryId } from "@core/types/country_id";

export interface GameStoreState {
  data: IGameData;
  country: CountryId;
}

export interface GameStoreAction {

}

const initialState: GameStoreState = {
  data: game.createGameData(Date.now()),
  country: CountryId.None,
}

export const useGameStore = create(
  immer<GameStoreState & GameStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);