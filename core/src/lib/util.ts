import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
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

function getAdjacentTiles(data: IGameData, pos: { x: number, y: number }): ITile[] {
  const tiles: (ITile | undefined)[] = [];

  if (pos.x - 1 >= 0 && pos.y - 1 >= 0)
    tiles.push(data.tiles[(pos.x - 1) + (pos.y - 1) * data.width]); // NW

  if (pos.y - 1 >= 0)
    tiles.push(data.tiles[(pos.x + 0) + (pos.y - 1) * data.width]); // N

  if (pos.x + 1 < data.width && pos.y - 1 >= 0)
    tiles.push(data.tiles[(pos.x + 1) + (pos.y - 1) * data.width]); // NE

  if (pos.x - 1 >= 0 && pos.y + 1 < data.height)
    tiles.push(data.tiles[(pos.x - 1) + (pos.y + 1) * data.width]); // SW

  if (pos.y + 1 < data.height)
    tiles.push(data.tiles[(pos.x + 0) + (pos.y + 1) * data.width]); // S

  if (pos.x + 1 < data.width && pos.y + 1 < data.height)
    tiles.push(data.tiles[(pos.x + 1) + (pos.y + 1) * data.width]); // SE

  if (pos.x - 1 >= 0)
    tiles.push(data.tiles[(pos.x - 1) + (pos.y + 0) * data.width]); // W

  if (pos.x + 1 < data.width)
    tiles.push(data.tiles[(pos.x + 1) + (pos.y + 0) * data.width]); // E

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
  let bonus = 0;

  const fromAdjacent = getAdjacentTiles(data, from.pos);
  const toAdjacent = getAdjacentTiles(data, to.pos);

  fromAdjacent.forEach(t => {
    if (!from.unit || !to.unit || !t.unit) return;

    if (t.unit.id === from.unit.id) bonus += 0.5;
    if (t.unit.id === to.unit.id) bonus += -1.0;
  });

  toAdjacent.forEach(t => {
    if (!from.unit || !to.unit || !t.unit) return;

    if (t.unit.id === from.unit.id) bonus += -1.0;
    if (t.unit.id === to.unit.id) bonus += 0.5;
  });

  // Only add forest bonus if it belongs to the same country-unit
  if (from.owner.id === from.unit.id) {
    switch (from.landmark) {
      case LandmarkId.Forest: bonus += 2.0; break;
      default: break;
    }
  }

  // Only add mountains bonus if it belongs to the same country-unit
  if (to.owner.id === to.unit.id) {
    switch (to.landmark) {
      case LandmarkId.Mountains: bonus -= 2.0; break;
      default: break;
    }
  }

  return bonus;
}

export const util = {
  countryToTurnType,
  turnTypeToCountry,

  compareTile,

  getTurnType,

  getAdjacentTiles,
  getMoveableTiles,

  getWarModifier,
}