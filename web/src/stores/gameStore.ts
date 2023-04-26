import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { game } from "@core/game";
import { IGameData } from "@core/gamedata";

export interface GameStoreState {
  data: IGameData;
}

export interface GameStoreAction {

}

const initialState: GameStoreState = {
  data: game.createGameData(Date.now()),
}

export const useGameStore = create(
  immer<GameStoreState & GameStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);