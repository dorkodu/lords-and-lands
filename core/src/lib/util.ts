import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
import { TurnType } from "../types/turn_type";
import { ICountry } from "./country";

function countryToTurnType(country: ICountry | undefined): TurnType {
  switch (country?.id) {
    case CountryId.Green: return TurnType.CountryGreen;
    case CountryId.Purple: return TurnType.CountryPurple;
    case CountryId.Red: return TurnType.CountryRed;
    case CountryId.Yellow: return TurnType.CountryYellow;
    default: return TurnType.None;
  }
}

function turnTypeToCountry(type: TurnType | undefined): CountryId {
  switch (type) {
    case TurnType.CountryGreen: return CountryId.Green;
    case TurnType.CountryPurple: return CountryId.Purple;
    case TurnType.CountryRed: return CountryId.Red;
    case TurnType.CountryYellow: return CountryId.Yellow;
    default: return CountryId.None;
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

  if (turn % specialTurnOffset === 0) {
    return TurnType.Banner;
  }
  else {
    return util.countryToTurnType(data.countries[turnOffset % countryCount]);
  }
}

export const util = {
  countryToTurnType,
  turnTypeToCountry,
  
  getTurnType,
}