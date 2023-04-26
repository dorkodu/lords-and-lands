import { ICountry } from "./lib/country"
import { createSeedRandom, ISeedRandom } from "./lib/seed_random";
import { ITile } from "./lib/tile";

export interface IGameData {
  countries: ICountry[];
  tiles: ITile[];

  running: boolean;
  turn: {
    count: number;
    country: ICountry | undefined;
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
      country: undefined,
    },

    rng: createSeedRandom(seed),
    width: 0,
    height: 0,
  }
}