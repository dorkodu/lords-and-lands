import { IGameData } from "../gamedata";
import { ICountry } from "../lib/country";
import { createUnit } from "../lib/unit";
import { util } from "../lib/util";
import { ActionId } from "../types/action_id";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
import { TileType } from "../types/tile_type";
import { TurnType } from "../types/turn_type";

type Info = { country: CountryId | undefined };
export type IActionNextTurn = { id: ActionId.NextTurn, info: Info };

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
  const currentCountry = util.turnTypeToCountry(data, data.turn.type);

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
      countryTurn(data, currentCountry);
      break;
    default:
      break;
  }
}

function bannerTurn(data: IGameData) {
  data.countries.forEach(c => { c.banners++ });
}

function chestTurn(data: IGameData) {
  const availableTiles = data.tiles.filter(t => {
    if (t.unit) return false;
    if (t.landmark !== LandmarkId.None) return false;
    return true;
  });

  const random = data.rng.number(0, availableTiles.length);

  const tile = availableTiles[random];
  if (!tile) return;

  tile.landmark = LandmarkId.Chest;
}

function countryTurn(data: IGameData, currentCountry: ICountry | undefined) {
  if (!currentCountry) return;

  // Banner unit spawn
  data.tiles.forEach(tile => {
    if (tile.unit) return;
    if (tile.owner !== currentCountry.id) return;
    if (tile.landmark !== LandmarkId.Banner) return;

    tile.unit = createUnit(currentCountry.id);
  });

  // Unit attacked & moved changes
  data.tiles.forEach(tile => {
    if (!tile.unit) return;
    if (tile.unit.id !== currentCountry.id) return;

    tile.unit.attacked = false;
    tile.unit.moved = false;
  });

  // Ownership changes
  data.tiles.forEach(tile => {
    if (!tile.unit) return;
    if (tile.unit.id !== currentCountry.id) return;

    if (tile.owner !== tile.unit.id) {
      switch (tile.landmark) {
        // Banner takes 2 turn to change ownership
        case LandmarkId.Banner:
          if (tile.type === TileType.Settled) tile.type = TileType.Nomad;
          else if (tile.type === TileType.Nomad) tile.owner = currentCountry.id;
          break;

        // If anything else than banner, it takes 1 turn to change ownership
        default:
          tile.owner = currentCountry.id;
          break;
      }
    }
  });
}