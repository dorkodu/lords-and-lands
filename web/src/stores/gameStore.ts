import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { game } from "@core/game";
import { IGameData } from "@core/gamedata";
import { ICountry } from "@core/lib/country";

export interface GameStoreState {
  data: IGameData;
  country: ICountry | undefined;
}

export interface GameStoreAction {

}

const initialState: GameStoreState = {
  data: game.createGameData(Date.now()),
  country: undefined,
}

export const useGameStore = create(
  immer<GameStoreState & GameStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);