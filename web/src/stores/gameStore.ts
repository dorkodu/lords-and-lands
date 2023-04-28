import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { game } from "@core/game";
import { IGameData } from "@core/gamedata";
import { ICountry } from "@core/lib/country";
import { ITile } from "@core/lib/tile";

export interface GameStoreState {
  data: IGameData;
  country: ICountry | undefined;

  hoveredTile: ITile | undefined;
  selectedUnitTile: ITile | undefined;
  moveableTiles: ITile[];

  map: { positionX: number, positionY: number, scale: number };
}

export interface GameStoreAction {

}

const initialState: GameStoreState = {
  data: game.createGameData(Date.now()),
  country: undefined,

  hoveredTile: undefined,
  selectedUnitTile: undefined,
  moveableTiles: [],

  map: { positionX: 0, positionY: 0, scale: 1 },
}

export const useGameStore = create(
  immer<GameStoreState & GameStoreAction>((_set, _get) => ({
    ...initialState,
  }))
);