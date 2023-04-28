import { useGameStore } from "@/stores/gameStore"
import { ITile } from "@core/lib/tile";
import { useEffect, useMemo } from "react";
import { useHover } from '@mantine/hooks';
import { game } from "@core/game";
import { useOnClick } from "../hooks";

import LandmarkBanner from "@/assets/landmarks/banner.png";
import Cursor from "@/assets/misc/cursor.png";
import { assets } from "@/assets/assets";

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
  const hoveredTile = useGameStore(state => state.hoveredTile);
  const moveableTiles = useGameStore(state => state.moveableTiles);

  const canUnitMove = country && game.util.getMoveableTiles(data, country.id, tile.pos).length > 0;

  const divTransform = useMemo(() => `translate(${tile.pos.x * 128}px, ${tile.pos.y * 128}px)`, [tile.pos]);
  const imgTransform = useMemo(() => `translate(0px, 0px)`, []);
  const unitTransform = useMemo(() => `translate(0px, 32px) scale(0.5)`, []);
  const unitFilter = useMemo(() => !canUnitMove ? `brightness(50%)` : undefined, [canUnitMove]);
  const { hovered, ref } = useHover();

  useEffect(() => {
    if (!hovered) return;
    useGameStore.setState(s => {
      s.hoveredTile = s.data.tiles[tile.pos.x + tile.pos.y * s.data.width];
    });
  }, [hovered]);

  const event = () => {
    useGameStore.setState(s => {
      s.hoveredTile = s.data.tiles[tile.pos.x + tile.pos.y * s.data.width];

      if (!s.country) return;
      game.play.placeBanner(s.data, { countryId: s.country.id, pos: tile.pos });

      if (s.selectedUnitTile?.pos.x === tile.pos.x && s.selectedUnitTile?.pos.y === tile.pos.y) {
        s.selectedUnitTile = undefined;
        s.moveableTiles = [];
        return;
      }

      if (s.moveableTiles.filter(t => game.util.compareTile(t, tile)).length > 0) {
        if (s.selectedUnitTile) {
          game.play.moveUnit(
            s.data,
            { countryId: s.country.id, from: s.selectedUnitTile.pos, to: tile.pos }
          );
        }
      }

      s.moveableTiles = game.util.getMoveableTiles(s.data, s.country.id, tile.pos);
      s.selectedUnitTile = s.moveableTiles.length > 0 ? tile : undefined;
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
        src={assets.getTileSrc(tile)}
        style={{ position: "absolute", transform: imgTransform, zIndex: 0 }}
      />

      <img
        src={assets.getLandmarkSrc(tile)}
        style={{ position: "absolute", transform: imgTransform, zIndex: 1 }}
      />

      <img
        src={assets.getUnitSrc(tile)}
        style={{ position: "absolute", transform: unitTransform, zIndex: 2, filter: unitFilter }}
      />

      {country && game.play.placeBannerActable(data, { countryId: country.id, pos: tile.pos }) &&
        <img
          src={LandmarkBanner}
          style={{ position: "absolute", transform: imgTransform, zIndex: 2, filter: "invert(100%)" }}
        />
      }

      {moveableTiles.filter(t => t === tile).length > 0 &&
        <div
          style={{
            position: "absolute",
            transform: imgTransform,
            zIndex: 2,
            width: 128, height: 128,
            backgroundColor: "rgba(0, 0, 0, 0.375)",
          }}
        />
      }

      {game.util.compareTile(tile, hoveredTile) &&
        <img src={Cursor} style={{ position: "absolute", transform: imgTransform, zIndex: 3 }} />
      }
    </div>
  )
}