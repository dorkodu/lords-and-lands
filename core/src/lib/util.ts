import { CountryId } from "../types/country_id";
import { TurnType } from "../types/turn_type";
import { ICountry } from "./country";

function countryToTurnType(country: ICountry): TurnType {
  switch (country.id) {
    case CountryId.Green: return TurnType.CountryGreen;
    case CountryId.Purple: return TurnType.CountryPurple;
    case CountryId.Red: return TurnType.CountryRed;
    case CountryId.Yellow: return TurnType.CountryYellow;
    default: return TurnType.None;
  }
}

export const util = {
  countryToTurnType,
}