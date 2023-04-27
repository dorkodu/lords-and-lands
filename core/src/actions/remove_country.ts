import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";

type Info = { country: CountryId };

export function removeCountryActable(data: IGameData, info: Info): boolean {
  // If country already exist
  const existing = data.countries.filter(c => c.id === info.country).length > 0;
  if (existing) return false;

  return true;
}

export function removeCountry(data: IGameData, info: Info) {
  if (!removeCountryActable(data, info)) return;

  data.countries = data.countries.filter(c => c.id !== info.country);
}