import { ICountry } from "./lib/country"
import { createSeedRandom, ISeedRandom } from "./lib/seed_random";
import { ITile } from "./lib/tile";
import { TurnType } from "./types/turn_type";

export interface IGameData {
  countries: ICountry[];
  tiles: ITile[];

  running: boolean;
  turn: {
    count: number;
    type: TurnType;
  }

  rng: ISeedRandom;
  width: number;
  height: number;
}

export function createGameData(seed: number): IGameData {
  return {
    countries: [],
    tiles: [],

    running: false,
    turn: {
      count: 0,
      type: TurnType.None,
    },

    rng: createSeedRandom(seed),
    width: 0,
    height: 0,
  }
}