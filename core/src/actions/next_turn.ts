import { IGameData } from "../gamedata";
import { util } from "../lib/util";
import { CountryId } from "../types/country_id";
import { TurnType } from "../types/turn_type";

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

  const currentTurn = data.turn.type;

  data.turn.count++;
  data.turn.type = util.getTurnType(data, data.turn.count);

  switch (currentTurn) {
    case TurnType.Banner:
      bannerTurn();
      break;
    case TurnType.Chest:
      chestTurn();
      break;
    case TurnType.CountryGreen:
    case TurnType.CountryPurple:
    case TurnType.CountryRed:
    case TurnType.CountryYellow:
      countryTurn();
      break;
    default:
      break;
  }
}

function bannerTurn() {

}

function chestTurn() {

}

function countryTurn() {

}