import { useGameStore } from "@/stores/gameStore"
import { ITile } from "@core/lib/tile";
import { CountryId } from "@core/types/country_id";
import { TileType } from "@core/types/tile_type";
import { LandmarkId } from "@core/types/landmark_id";
import { useMemo } from "react";
import { useHover } from '@mantine/hooks';
import { game } from "@core/game";

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

import Cursor from "@/assets/misc/cursor.png";
import { useOnClick } from "../hooks";

export default function Tilemap() {
  const tiles = useGameStore(state => state.data.tiles);

  return (
    <>
      {tiles.map((tile, i) => <Tile tile={tile} key={i} />)}
    </>
  )
}

function Tile({ tile }: { tile: ITile }) {
  const data = useGameStore(state => state.data);
  const country = useGameStore(state => state.country);

  const divTransform = useMemo(() => `translate(${tile.pos.x * 128}px, ${tile.pos.y * 128}px)`, []);
  const imgTransform = useMemo(() => `translate(0px, 0px)`, []);
  const unitTransform = useMemo(() => `translate(0px, 32px) scale(0.5)`, []);
  const { hovered, ref } = useHover();

  const event = () => {
    useGameStore.setState(s => {
      if (!s.country) return;
      game.play.placeBanner(s.data, { countryId: s.country.id, pos: tile.pos });
    });
  }

  const {
    onClick,
    onMouseDown,
    onMouseMove,
    onTouchStart,
    onTouchMove,
  } = useOnClick(event)

  return (
    <div
      onClick={onClick}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove}
      style={{ position: "absolute", transform: divTransform, width: 128, height: 128 }}
      ref={ref}
    >
      <img
        src={getTileSrc(tile)}
        style={{ position: "absolute", transform: imgTransform, zIndex: 0 }}
      />

      <img
        src={getLandmarkSrc(tile)}
        style={{ position: "absolute", transform: imgTransform, zIndex: 1 }}
      />

      <img
        src={getUnitSrc(tile)}
        style={{ position: "absolute", transform: unitTransform, zIndex: 2 }}
      />

      {country && game.play.placeBannerActable(data, { countryId: country.id, pos: tile.pos }) &&
        <img
          src={LandmarkBanner}
          style={{ position: "absolute", transform: imgTransform, zIndex: 2, filter: "invert(100%)" }}
        />
      }

      {hovered && <img src={Cursor} style={{ position: "absolute", transform: imgTransform, zIndex: 3 }} />}
    </div>
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
  switch (tile.unit?.id) {
    case CountryId.Green: return UnitGreen;
    case CountryId.Purple: return UnitPurple;
    case CountryId.Red: return UnitRed;
    case CountryId.Yellow: return UnitYellow;
    default: return undefined;
  }
}