import { IGameData } from "../gamedata";
import { util } from "../lib/util";
import { ActionId } from "../types/action_id";
import { CountryId } from "../types/country_id";

type Info = { country: CountryId };
export type IActionRemoveCountry = { id: ActionId.RemoveCountry, info: Info };

export function removeCountryActable(data: IGameData, info: Info): boolean {
  // If country doesn't exist
  const existing = data.countries.filter(c => c.id === info.country).length > 0;
  if (!existing) return false;

  return true;
}

export function removeCountry(data: IGameData, info: Info) {
  if (!removeCountryActable(data, info)) return;

  data.countries = data.countries.filter(c => c.id !== info.country);

  // If current turn was the removed country's, skip to next turn
  const currentCountry = util.turnTypeToCountryId(data.turn.type);
  if (currentCountry === info.country) {
    data.turn.count++;
    data.turn.type = util.getTurnType(data, data.turn.count);
  }
}