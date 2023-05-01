import { createGameData, IGameData } from "./gamedata";
import { ICountry } from "./lib/country";
import { createSeedRandom } from "./lib/seed_random";
import { ITile } from "./lib/tile";
import { TurnType } from "./types/turn_type";

export interface ISerializedGameData {
  w: number;
  h: number;

  mapSeed: number;
  rngSeed: number;

  turnCount: number;
  turnType: TurnType;

  running: boolean;

  countries: ICountry[];
  tiles: ITile[];
}

function serialize(data: IGameData): ISerializedGameData {
  const serialized: ISerializedGameData = {
    w: data.width,
    h: data.height,

    mapSeed: data.seed,
    rngSeed: data.rng.seed,

    turnCount: data.turn.count,
    turnType: data.turn.type,

    running: data.running,

    countries: data.countries,
    tiles: data.tiles,
  };

  return serialized;
}

function deserialize(serialized: ISerializedGameData): IGameData {
  const data = createGameData();

  data.width = serialized.w;
  data.height = serialized.h;

  data.seed = serialized.mapSeed;
  data.rng = createSeedRandom(serialized.rngSeed);

  data.turn.count = serialized.turnCount;
  data.turn.type = serialized.turnType;

  data.running = serialized.running;

  data.countries = serialized.countries;
  data.tiles = serialized.tiles;

  return data;
}

export const serializer = {
  serialize,
  deserialize,
}