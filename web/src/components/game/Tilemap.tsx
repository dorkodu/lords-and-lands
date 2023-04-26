import { useGameStore } from "@/stores/gameStore"
import { ITile } from "@core/lib/tile";
import { CountryId } from "@core/types/country_id";
import { TileType } from "@core/types/tile_type";
import { LandmarkId } from "@core/types/landmark_id";
import { useMemo } from "react";

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

export default function Tilemap() {
  const tiles = useGameStore(state => state.data.tiles);

  return (
    <>
      {tiles.map((tile, i) => <Tile tile={tile} key={i} />)}
    </>
  )
}

function Tile({ tile }: { tile: ITile }) {
  const transform = useMemo(() => `translate(${tile.pos.x * 128}px, ${tile.pos.y * 128}px)`, []);
  const unitTransform = useMemo(() => `translate(${tile.pos.x * 128}px, ${tile.pos.y * 128 + 32}px) scale(0.5)`, []);
  return (
    <>
      <img
        src={getTileSrc(tile)}
        style={{ position: "absolute", transform, zIndex: 0 }}
      />

      <img
        src={getLandmarkSrc(tile)}
        style={{ position: "absolute", transform, zIndex: 1 }}
      />

      <img
        src={getUnitSrc(tile)}
        style={{ position: "absolute", transform: unitTransform, zIndex: 1 }}
      />
    </>
  )
}

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
  switch (tile.unit) {
    case CountryId.None: return undefined;
    case CountryId.Green: return UnitGreen;
    case CountryId.Purple: return UnitPurple;
    case CountryId.Red: return UnitRed;
    case CountryId.Yellow: return UnitYellow;
  }
}