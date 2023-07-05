import { IGameData } from "../gamedata";
import { util } from "../lib/util";
import { ActionId } from "../types/action_id";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";

type Info = {
  countryId: CountryId;
  from: { x: number, y: number };
  to: { x: number, y: number };
  bonus?: number;
}
export type IActionMoveUnit = { id: ActionId.MoveUnit, info: Info };

export function moveUnitActable(data: IGameData, info: Info): boolean {
  // If not started
  if (!data.running) return false;

  const fromTile = data.tiles[info.from.x + info.from.y * data.width];
  const toTile = data.tiles[info.to.x + info.to.y * data.width];
  if (!fromTile || !toTile) return false;
  if (!fromTile.unit) return false;

  // If toTile is not a moveable tile
  const moveableTiles = util.getMoveableTiles(data, fromTile.unit.id, fromTile.pos);
  if (moveableTiles.filter(t => t === toTile).length === 0) return false;

  // If it's not unit's country's turn
  const country = util.turnTypeToCountry(data, data.turn.type);
  if (country && fromTile.unit.id !== country.id) return false;

  return true;
}

export function moveUnit(data: IGameData, info: Info) {
  if (!moveUnitActable(data, info)) return;

  const fromTile = data.tiles[info.from.x + info.from.y * data.width];
  const toTile = data.tiles[info.to.x + info.to.y * data.width];
  if (!fromTile || !toTile) return;

  const country = data.countries.filter(c => c.id === fromTile.unit?.id)[0];
  if (!country) return;

  // War mechanic
  if (toTile.unit) {
    const modifier = util.getWarModifier(data, fromTile, toTile);
    const fromDice = data.rng.dice();
    const toDice = data.rng.dice();
    const total = (fromDice - toDice) + modifier + (info.bonus ?? 0);

    // If war is won
    if (total > 0) {
      toTile.unit = fromTile.unit;
      fromTile.unit = undefined;

      if (toTile.unit) toTile.unit.attacked = true;
    }
    // If war is lost
    else {
      fromTile.unit = undefined;
    }
  }
  // Movement mechanic
  else {
    toTile.unit = fromTile.unit;
    fromTile.unit = undefined;

    if (toTile.unit) toTile.unit.moved = true;

    // If moved into a chest, remove the chest & increase banners
    if (toTile.landmark === LandmarkId.Chest) {
      toTile.landmark = LandmarkId.None;
      country.banners++;
    }
  }
}