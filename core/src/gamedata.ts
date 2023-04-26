import { ICountry } from "./lib/country"
import { createSeedRandom, ISeedRandom } from "./lib/seed_random";
import { ITile } from "./lib/tile";

export interface IGameData {
  countries: ICountry[];
  tiles: ITile[];

  turn: {
    count: number;
    country: ICountry | undefined;
  }

  running: boolean;

  rng: ISeedRandom;
}

export function createGameData(seed: number): IGameData {
  return {
    countries: [],
    tiles: [],

    turn: {
      count: 0,
      country: undefined,
    },

    running: false,

    rng: createSeedRandom(seed),
  }
}