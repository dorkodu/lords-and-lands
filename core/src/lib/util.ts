import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
import { TileType } from "../types/tile_type";
import { TurnType } from "../types/turn_type";
import { ICountry } from "./country";
import { ITile } from "./tile";

function countryToTurnType(country: ICountry | undefined): TurnType {
  switch (country?.id) {
    case CountryId.Green: return TurnType.CountryGreen;
    case CountryId.Purple: return TurnType.CountryPurple;
    case CountryId.Red: return TurnType.CountryRed;
    case CountryId.Yellow: return TurnType.CountryYellow;
    default: return TurnType.None;
  }
}

function turnTypeToCountry(data: IGameData, type: TurnType | undefined): ICountry | undefined {
  switch (type) {
    case TurnType.CountryGreen: return data.countries.filter(c => c.id === CountryId.Green)[0];
    case TurnType.CountryPurple: return data.countries.filter(c => c.id === CountryId.Purple)[0];
    case TurnType.CountryRed: return data.countries.filter(c => c.id === CountryId.Red)[0];
    case TurnType.CountryYellow: return data.countries.filter(c => c.id === CountryId.Yellow)[0];
    default: return undefined;
  }
}

function turnTypeToCountryId(type: TurnType | undefined): CountryId {
  switch (type) {
    case TurnType.CountryGreen: return CountryId.Green;
    case TurnType.CountryPurple: return CountryId.Purple;
    case TurnType.CountryRed: return CountryId.Red;
    case TurnType.CountryYellow: return CountryId.Yellow;
    default: return CountryId.None;
  }
}

function compareTile(t1: ITile | undefined, t2: ITile | undefined): boolean {
  if (!t1 || !t2) return false;
  if (t1.pos.x === t2.pos.x && t1.pos.y === t2.pos.y) return true;
  return false;
}

/**
 * After each country plays for 3 turns, a special turn happens.
 * @param data 
 * @param turn 
 */
function getTurnType(data: IGameData, turn: number): TurnType {
  const countryCount = data.countries.length;
  const specialTurnOffset = countryCount * 3 + 1;
  const turnOffset = (turn - 1) - Math.floor(turn / specialTurnOffset);

  if (turn < 0) return TurnType.None;

  if (turn % specialTurnOffset === 0) {
    if (turn % 2 === 1) return TurnType.Chest;
    else return TurnType.Banner;
  }

  return util.countryToTurnType(data.countries[turnOffset % countryCount]);
}

function getAdjacentTiles(data: IGameData, pos: { x: number, y: number }, depth: number = 1): ITile[] {
  const tiles: (ITile | undefined)[] = [];

  const x = pos.x;
  const y = pos.y;

  // N, NE, E, SE, S, SW, W, NW

  // Corners
  tiles.push(util.getTile(data, (x + depth), (y - depth)));
  tiles.push(util.getTile(data, (x + depth), (y + depth)));
  tiles.push(util.getTile(data, (x - depth), (y + depth)));
  tiles.push(util.getTile(data, (x - depth), (y - depth)));

  // Sides
  for (let i = -depth + 1; i < depth; i++) {
    tiles.push(util.getTile(data, (x + i), (y + depth)));
    tiles.push(util.getTile(data, (x + depth), (y + i)));
    tiles.push(util.getTile(data, (x + i), (y + depth)));
    tiles.push(util.getTile(data, (x + depth), (y + i)));
  }

  return tiles.filter(t => t) as ITile[];
}

function getMoveableTiles(data: IGameData, countryId: CountryId, pos: { x: number, y: number }): ITile[] {
  const tile = data.tiles[pos.x + pos.y * data.width];
  if (!tile) return [];

  // If no unit exist
  if (!tile.unit) return [];

  // If unit doesn't belong to the country
  if (tile.unit.id !== countryId) return [];

  // If unit already attacked
  if (tile.unit.attacked) return [];

  const adjacent: ITile[] = getAdjacentTiles(data, pos);

  const tiles = adjacent.filter(t => {
    // If same country's unit
    if (t.unit && t.unit.id === countryId) return false;

    // If unit already moved and there is no unit to attack
    if (tile.unit?.moved && !t.unit) return false;

    return true;
  });

  return tiles;
}

function getWarModifier(data: IGameData, from: ITile, to: ITile): number {
  if (!from.unit || !to.unit) return 0;

  const fromBonus = getUnitModifier(data, from.unit.id, from.pos);
  const toBonus = getUnitModifier(data, from.unit.id, to.pos);

  if (fromBonus === undefined || toBonus === undefined) return 0;
  return fromBonus - toBonus;
}

function getUnitModifier(data: IGameData, countryId: CountryId, pos: { x: number, y: number }): number | undefined {
  const tile = data.tiles[pos.x + pos.y * data.width];
  if (!tile) return undefined;
  if (!tile.unit) return undefined;
  const adjacent = getAdjacentTiles(data, pos);

  let modifier = 0;

  // If our unit, only add forest bonus
  if (tile.unit.id === countryId) {
    if (tile.landmark === LandmarkId.Forest) modifier += 2.0;
  }
  // If not our unit, only add mountains bonus
  else {
    if (tile.landmark === LandmarkId.Mountains) modifier += 2.0;
  }

  // Adjacent unit bonuses
  adjacent.forEach(t => {
    if (!t.unit || !tile.unit) return;

    if (t.unit.id === tile.unit.id) modifier += 0.5;
    else modifier += -0.5;
  });

  return modifier;
}

function getAliveCountries(data: IGameData): Record<CountryId, boolean> {
  const status = {} as Record<CountryId, boolean>;
  const countries = {} as Record<CountryId, ICountry>;

  // Initialize the statuses
  data.countries.forEach(c => {
    status[c.id] = false;
    countries[c.id] = c;
  });

  data.tiles.forEach(t => {
    // If country has a banner, it's alive
    if (t.landmark === LandmarkId.Banner) { status[t.owner] = true; return; }

    // If country has a unit, it's alive
    if (t.unit && t.unit.id) { status[t.unit.id] = true; return; }

    const country = countries[t.owner];
    if (!country) return;

    // If country has a nomad tile & banner to place, it's alive
    if (t.type === TileType.Nomad && country.banners > 0) { status[t.owner] = true; return; }
  });

  return status;
}

function getTile(data: IGameData, x: number, y: number): ITile | undefined {
  if (x < 0 || x >= data.width) return undefined;
  if (y < 0 || y >= data.height) return undefined;
  return data.tiles[x + y * data.width];
}

function isEnemyTile(tile: ITile | undefined, country: CountryId) {
  if (!tile) return false;
  return tile.owner !== country;
}

export const util = {
  countryToTurnType,
  turnTypeToCountry,
  turnTypeToCountryId,

  compareTile,

  getTurnType,

  getAdjacentTiles,
  getMoveableTiles,

  getWarModifier,
  getUnitModifier,

  getAliveCountries,

  getTile,
  isEnemyTile,
}