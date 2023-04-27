import { IGameData } from "../gamedata";
import { util } from "../lib/util";
import { CountryId } from "../types/country_id";

type Info = { country: CountryId };

export function nextTurnActable(data: IGameData, info: Info): boolean {
  const currentCountry = util.turnTypeToCountry(data.turn.type);

  // Any country can pass the turn if it's no other country's turn
  if (currentCountry === CountryId.None) return true;

  // If current country is trying to pass the turn
  if (currentCountry === info.country) return true;

  return false;
}

export function nextTurn(data: IGameData, info: Info) {
  if (!nextTurnActable(data, info)) return;

  console.log("next turn");
}