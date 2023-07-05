import { createGameData, IGameData } from "./gamedata";
import { gameplay } from "./gameplay";
import { ICountry } from "./lib/country";
import { createSeedRandom } from "./lib/seed_random";
import { ITile } from "./lib/tile";
import { util } from "./lib/util";
import { CountryId } from "./types/country_id";
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

  // When a player leaves the game but his country is still alive,
  // player's turn won't be available when the save is reloaded.
  // So check alive countries, if one is not already in data.countries,
  // add it (though if player had banners, they will be reset as info is deleted).
  const aliveCountries = util.getAliveCountries(data);
  for (const [key, _value] of Object.entries(aliveCountries)) {
    // TODO: This is very dangerous
    const countryId = parseInt(key) as any as CountryId;

    const exists = data.countries.filter(c => c.id === countryId).length > 0;
    if (!exists) gameplay.addCountry(data, { country: countryId });
  }

  return data;
}

export const serializer = {
  serialize,
  deserialize,
}