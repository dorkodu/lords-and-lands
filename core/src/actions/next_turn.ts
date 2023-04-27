import { IGameData } from "../gamedata";
import { util } from "../lib/util";
import { CountryId } from "../types/country_id";
import { TurnType } from "../types/turn_type";

type Info = { country: CountryId | undefined };

export function nextTurnActable(data: IGameData, info: Info): boolean {
  const currentCountry = util.turnTypeToCountry(data, data.turn.type);

  // Any country can pass the turn if it's no other country's turn
  if (!currentCountry) return true;

  // If current country is trying to pass the turn
  if (currentCountry.id === info.country) return true;

  return false;
}

export function nextTurn(data: IGameData, info: Info) {
  if (!nextTurnActable(data, info)) return;

  const currentTurn = data.turn.type;

  data.turn.count++;
  data.turn.type = util.getTurnType(data, data.turn.count);

  switch (currentTurn) {
    case TurnType.Banner:
      bannerTurn(data);
      break;
    case TurnType.Chest:
      chestTurn(data);
      break;
    case TurnType.CountryGreen:
    case TurnType.CountryPurple:
    case TurnType.CountryRed:
    case TurnType.CountryYellow:
      countryTurn(data);
      break;
    default:
      break;
  }
}

function bannerTurn(data: IGameData) {
  data.countries.forEach(c => { c.banners++ });
}

function chestTurn(data: IGameData) {

}

function countryTurn(data: IGameData) {

}