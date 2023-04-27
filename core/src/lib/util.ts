import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
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

  if (turn % specialTurnOffset === 0) return TurnType.Banner;
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

export const util = {
  countryToTurnType,
  turnTypeToCountry,

  getTurnType,

  getAdjacentTiles,
}