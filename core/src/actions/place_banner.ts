import { IGameData } from "../gamedata";
import { createUnit } from "../lib/unit";
import { util } from "../lib/util";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
import { TileType } from "../types/tile_type";

type Info = { countryId: CountryId, pos: { x: number, y: number } };

export function placeBannerActable(data: IGameData, info: Info): boolean {
  const country = data.countries.filter(c => c.id === info.countryId)[0];
  if (!country) return false;

  const currentCountry = util.turnTypeToCountry(data, data.turn.type);
  if (!currentCountry) return false;

  if (currentCountry.id !== country.id) return false;

  const tile = data.tiles[info.pos.x + info.pos.y * data.width];
  if (!tile) return false;

  // If current country has no banners to place
  if (country.banners <= 0) return false;

  // If tile is not owned
  if (tile.owner.id !== country.id) return false;

  // If the tile is not nomad
  if (tile.type !== TileType.Nomad) return false;

  // If tile already has another landmark
  if (tile.landmark !== LandmarkId.None) return false;

  // If tile has a unit on it
  if (tile.unit) return false;

  // TODO: Don't allow if there is adjacent enemy unit
  //const adjacent = getAdjacentTiles(data, pos);

  return true;
}

export function placeBanner(data: IGameData, info: Info) {
  if (!placeBannerActable(data, info)) return;

  const country = data.countries.filter(c => c.id === info.countryId)[0];
  if (!country) return;

  const tile = data.tiles[info.pos.x + info.pos.y * data.width];
  if (!tile) return;

  tile.type = TileType.Settled;
  tile.landmark = LandmarkId.Banner;
  tile.unit = createUnit(country.id);
  country.banners--;

  const adjacent = util.getAdjacentTiles(data, info.pos);
  adjacent.forEach(t => {
    // If tile is already settled
    if (t.type === TileType.Settled) return;

    // If tile has a unit that is not own unit
    if (t.unit && t.unit.id !== country.id) return;

    t.owner = country;
    t.type = TileType.Settled;
  });
}