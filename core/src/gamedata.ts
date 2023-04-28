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

  /**
   * This seed is only used for map generation.
   */
  seed: number;
}

export function createGameData(): IGameData {
  return {
    countries: [],
    tiles: [],

    running: false,
    turn: {
      count: 0,
      type: TurnType.None,
    },

    rng: createSeedRandom(Date.now()),

    width: 0,
    height: 0,
    seed: Date.now(),
  }
}