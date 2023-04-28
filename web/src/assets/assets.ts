import { ITile } from "@core/lib/tile";
import { CountryId } from "@core/types/country_id";
import { LandmarkId } from "@core/types/landmark_id";

import TileNoneNomad from "@/assets/tiles/none_nomad.png";
import TileGreenNomad from "@/assets/tiles/green_nomad.png";
import TilePurpleNomad from "@/assets/tiles/purple_nomad.png";
import TileRedNomad from "@/assets/tiles/red_nomad.png";
import TileYellowNomad from "@/assets/tiles/yellow_nomad.png";

import TileNoneSettled from "@/assets/tiles/none_settled.png";
import TileGreenSettled from "@/assets/tiles/green_settled.png";
import TilePurpleSettled from "@/assets/tiles/purple_settled.png";
import TileRedSettled from "@/assets/tiles/red_settled.png";
import TileYellowSettled from "@/assets/tiles/yellow_settled.png";

import LandmarkBanner from "@/assets/landmarks/banner.png";
import LandmarkChest from "@/assets/landmarks/chest.png";
import LandmarkForest from "@/assets/landmarks/forest.png";
import LandmarkMountains from "@/assets/landmarks/mountains.png";

import UnitGreen from "@/assets/units/green.png";
import UnitPurple from "@/assets/units/purple.png";
import UnitRed from "@/assets/units/red.png";
import UnitYellow from "@/assets/units/yellow.png";
import { TileType } from "@core/types/tile_type";

function getTileSrc(tile: ITile) {
  switch (tile.owner.id) {
    case CountryId.None:
      if (tile.type === TileType.Nomad) return TileNoneNomad;
      return TileNoneSettled;

    case CountryId.Green:
      if (tile.type === TileType.Nomad) return TileGreenNomad;
      return TileGreenSettled;

    case CountryId.Purple:
      if (tile.type === TileType.Nomad) return TilePurpleNomad;
      return TilePurpleSettled;

    case CountryId.Red:
      if (tile.type === TileType.Nomad) return TileRedNomad;
      return TileRedSettled;

    case CountryId.Yellow:
      if (tile.type === TileType.Nomad) return TileYellowNomad;
      return TileYellowSettled;

    default: return undefined;
  }
}

function getLandmarkSrc(tile: ITile) {
  switch (tile.landmark) {
    case LandmarkId.None: return undefined;
    case LandmarkId.Banner: return LandmarkBanner;
    case LandmarkId.Mountains: return LandmarkMountains;
    case LandmarkId.Forest: return LandmarkForest;
    case LandmarkId.Chest: return LandmarkChest;
  }
}

function getUnitSrc(tile: ITile) {
  switch (tile.unit?.id) {
    case CountryId.Green: return UnitGreen;
    case CountryId.Purple: return UnitPurple;
    case CountryId.Red: return UnitRed;
    case CountryId.Yellow: return UnitYellow;
    default: return undefined;
  }
}

function countryIdToUnitSrc(countryId: CountryId): string | undefined {
  switch (countryId) {
    case CountryId.Green: return UnitGreen;
    case CountryId.Purple: return UnitPurple;
    case CountryId.Red: return UnitRed;
    case CountryId.Yellow: return UnitYellow;
    default: return undefined;
  }
}

export const assets = {
  getTileSrc,
  getLandmarkSrc,
  getUnitSrc,

  countryIdToUnitSrc,
}