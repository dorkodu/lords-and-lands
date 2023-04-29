import { IGameData } from "../gamedata";
import { createCountry } from "../lib/country";
import { ActionId } from "../types/action_id";
import { CountryId } from "../types/country_id";

type Info = { country: CountryId };
export type IActionAddCountry = { id: ActionId.AddCountry, info: Info };

export function addCountryActable(data: IGameData, info: Info): boolean {
  // If country already exist
  const existing = data.countries.filter(c => c.id === info.country).length > 0;
  if (existing) return false;

  // If country is none
  if (info.country === CountryId.None) return false;

  return true;
}

export function addCountry(data: IGameData, info: Info) {
  if (!addCountryActable(data, info)) return;

  data.countries.push(createCountry(info.country));
}