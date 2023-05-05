import { useGameStore } from "@/stores/gameStore"
import { ITile } from "@core/lib/tile";
import { useEffect, useMemo } from "react";
import { useHover } from '@mantine/hooks';
import { game } from "@core/game";
import { useOnClick } from "../hooks";

import LandmarkBanner from "@/assets/landmarks/banner.png";
import Cursor from "@/assets/misc/cursor.png";
import { assets } from "@/assets/assets";
import { IGameData } from "@core/gamedata";
import { ICountry } from "@core/lib/country";
import { Piece } from "../TextParser";
import { Flex, Text } from "@mantine/core";
import { useAppStore } from "@/stores/appStore";
import { socketio } from "@/lib/socketio";
import { ActionId } from "@core/types/action_id";

export default function Tilemap() {
  const [width, height] = useGameStore(state => [state.data.width, state.data.height]);
  const tiles = useGameStore(state => state.data.tiles);

  const memoized = useMemo(() => (
    <div style={{ width: width * 128, height: height * 128 }}>
      {tiles.map((tile, i) => <Tile tile={tile} key={i} />)}
    </div>
  ), [tiles, width, height]);

  return memoized;
}

function Tile({ tile }: { tile: ITile }) {
  const data = useGameStore(state => state.data);
  const country = useGameStore(state => state.country);
  const hoveredTile = useGameStore(state => state.hoveredTile);
  const moveableTiles = useGameStore(state => state.moveableTiles);

  const online = useAppStore(state => state.lobby.online);

  const relativeCountry = !online ? country : game.util.turnTypeToCountry(data, data.turn.type);
  const canUnitMove = relativeCountry && game.util.getMoveableTiles(data, relativeCountry.id, tile.pos).length > 0;

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
    const online = useAppStore.getState().lobby.online;

    useGameStore.setState(s => {
      s.hoveredTile = s.data.tiles[tile.pos.x + tile.pos.y * s.data.width];

      if (!s.country) return;

      // Send place banner action if actable
      const info = { countryId: s.country.id, pos: tile.pos };
      if (game.play.placeBannerActable(s.data, info)) {
        if (online) socketio.emit("client-game-action", { id: ActionId.PlaceBanner, info });
        else game.play.placeBanner(s.data, info);

        // Player did action
        s.didAction = true;
      }

      if (s.selectedUnitTile?.pos.x === tile.pos.x && s.selectedUnitTile?.pos.y === tile.pos.y) {
        s.selectedUnitTile = undefined;
        s.moveableTiles = [];
        return;
      }

      if (s.moveableTiles.filter(t => game.util.compareTile(t, tile)).length > 0 && s.selectedUnitTile) {
        // Send move unit action if actable
        const info = { countryId: s.country.id, from: s.selectedUnitTile.pos, to: tile.pos };
        if (game.play.moveUnitActable(s.data, info)) {
          if (online) socketio.emit("client-game-action", { id: ActionId.MoveUnit, info });
          else game.play.moveUnit(s.data, info);

          // Player did action
          s.didAction = true;
        }
      }

      // If current player's turn, highlight & show tiles
      if (s.country.id === game.util.turnTypeToCountry(s.data, s.data.turn.type)?.id) {
        s.moveableTiles = game.util.getMoveableTiles(s.data, s.country.id, tile.pos);
        s.selectedUnitTile = s.moveableTiles.length > 0 ? tile : undefined;
      }
      else {
        s.moveableTiles = [];
        s.selectedUnitTile = undefined;
      }
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
      <TileModifier data={data} country={relativeCountry} tile={tile} />

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

function TileModifier({ data, country, tile }: { data: IGameData, country?: ICountry, tile: ITile }) {
  const dice = useMemo(() => <Piece.Emoji emoji="🎲" />, []);
  const formatter = useMemo(() => new Intl.NumberFormat("en", { signDisplay: "exceptZero" }), []);
  const modifier = country && game.util.getUnitModifier(data, country.id, tile.pos);

  // Don't show modifier if it's 0 or undefined
  if (!modifier) return null;

  return (
    <Flex
      align="center"
      justify="center"
      style={{
        position: "absolute",
        zIndex: 10,
        width: 128,
        textShadow: "-2px -2px 0 rgba(0, 0, 0, 0.5), 2px -2px 0 rgba(0, 0, 0, 0.5), -2px 2px 0 rgba(0, 0, 0, 0.5), 2px 2px 0 rgba(0, 0, 0, 0.5)",
      }}
    >
      <Text weight="bold" size={32} color="white">{formatter.format(modifier)}</Text>
      {dice}
    </Flex>
  )
}