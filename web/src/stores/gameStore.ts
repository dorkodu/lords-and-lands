import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { game } from "@core/game";
import { IGameData } from "@core/gamedata";
import { TurnType } from "@core/types/turn_type";

export interface GameStoreState {
  data: IGameData;
  olderTurns: TurnType[];
  newerTurns: TurnType[];
}

export interface GameStoreAction {

}

const initialState: GameStoreState = {
  data: game.createGameData(Date.now()),
  olderTurns: [TurnType.Banner, TurnType.Banner, TurnType.Chest, TurnType.Chest],
  newerTurns: [TurnType.CountryPurple, TurnType.CountryRed, TurnType.CountryYellow, TurnType.CountryGreen],
}

export const useGameStore = create(
  immer<GameStoreState & GameStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);