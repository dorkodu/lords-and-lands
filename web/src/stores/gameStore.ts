import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export interface GameStoreState {

}

export interface GameStoreAction {

}

const initialState: GameStoreState = {

}

export const useGameStore = create(
  immer<GameStoreState & GameStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);