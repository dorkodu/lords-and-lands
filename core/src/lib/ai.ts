import { game } from "../game";
import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
import { ITile } from "./tile";
import { util } from "./util";

function play(data: IGameData, countryId: CountryId, minimumAttackModifier: number) {
  const country = data.countries.filter(c => c.id === countryId)[0];
  if (!country) return;

  const unitTiles: ITile[] = [];
  const bannerTiles: ITile[] = [];
  const emptyOwnTiles: ITile[] = [];

  data.tiles.forEach(t => {
    if (t.unit && t.unit.id === countryId) unitTiles.push(t);
    if (t.owner === countryId && t.landmark === LandmarkId.Banner) bannerTiles.push(t);
    if (t.owner === countryId && t.landmark === LandmarkId.None) emptyOwnTiles.push(t);
  });

  // AI stages:
  // 1. Place banner
  // 2. Move armies away from the banner
  // 3. Move armies to better tiles that have better modifiers
  // 4. Attack if accepted attack modifier level is met

  // 1. Place banner
  if (country.banners > 0) {
    const safety = emptyOwnTiles.map(t => getTileSafety(data, t)).sort((a, b) => b.safety - a.safety);

    while (country.banners > 0 && safety.length > 0) {
      const tile = safety.shift();
      if (!tile) break;

      game.play.placeBanner(data, { countryId, pos: tile.tile.pos });
    }
  }

  // 2. Move armies away from the banner
  bannerTiles.forEach(t => {
    if (!t.unit || t.unit.id !== countryId) return;
    moveUnitAway(data, t);
  });

  // 3. Move armies to better tiles that have better modifiers

  // 4. Attack if accepted attack modifier level is met
  unitTiles.forEach(t => {
    attackUnit(data, t, minimumAttackModifier);
  });
}

function getTileSafety(data: IGameData, tile: ITile): { tile: ITile, safety: number } {
  // X X X X X
  // X X X X X
  // X Y Y Y X
  // Y Y Y Y Y
  // Y Y Y Y Y
  //
  // Assume calculating safety of tiles for Y:
  //
  // X X X X X
  // X X X X X
  // X 1 1 1 X
  // 1 1 2 1 1
  // 2 2 2 2 2

  let x = tile.pos.x;
  let y = tile.pos.y;

  let depth = 1;

  while (depth < data.width || depth < data.height) {
    // N, NE, E, SE, S, SW, W, NW

    // Corners
    const ne = util.getTile(data, (x + depth), (y - depth));
    if (util.isEnemyTile(ne, tile.owner)) return { tile, safety: depth };
    const se = util.getTile(data, (x + depth), (y + depth));
    if (util.isEnemyTile(se, tile.owner)) return { tile, safety: depth };
    const sw = util.getTile(data, (x - depth), (y + depth));
    if (util.isEnemyTile(sw, tile.owner)) return { tile, safety: depth };
    const nw = util.getTile(data, (x - depth), (y - depth));
    if (util.isEnemyTile(nw, tile.owner)) return { tile, safety: depth };

    // Sides
    for (let i = -depth + 1; i < depth; i++) {
      const n = util.getTile(data, (x + i), (y + depth));
      if (util.isEnemyTile(n, tile.owner)) return { tile, safety: depth };
      const e = util.getTile(data, (x + depth), (y + i));
      if (util.isEnemyTile(e, tile.owner)) return { tile, safety: depth };
      const s = util.getTile(data, (x + i), (y + depth));
      if (util.isEnemyTile(s, tile.owner)) return { tile, safety: depth };
      const w = util.getTile(data, (x + depth), (y + i));
      if (util.isEnemyTile(w, tile.owner)) return { tile, safety: depth };
    }

    depth++;
  }

  return { tile, safety: -1 };
}

/**
 * Check all adjacent tiles of a unit, if empty tile exists moves the unit.
 * Otherwise finds friendly units in adjacent tiles, then performs the same
 * check again for that unit. If unit is moved, the previous units are also moved.
 * @param data 
 * @param tile 
 * @returns 
 */
function moveUnitAway(data: IGameData, tile: ITile): boolean {
  const stack: ITile[] = [tile];
  const visited: Set<string> = new Set();

  while (stack.length > 0) {
    const currentTile = stack.pop();
    if (!currentTile) continue;

    const tileKey = `${currentTile.pos.x},${currentTile.pos.y}`;
    if (visited.has(tileKey)) continue;

    visited.add(tileKey);

    const countryId = currentTile.unit?.id;
    if (countryId === undefined) continue;

    const adjacent = util.getAdjacentTiles(data, currentTile.pos);
    const blocked: ITile[] = [];
    let moved = false;

    for (const [_key, t] of Object.entries(adjacent)) {
      if (t.unit && t.unit.id !== countryId) continue;
      if (t.landmark === LandmarkId.Banner) continue;

      if (!game.play.moveUnitActable(data, { from: currentTile.pos, to: t.pos, countryId })) {
        if (t.unit && t.unit.id === countryId) blocked.push(t);
      }
      else {
        game.play.moveUnit(data, { from: currentTile.pos, to: t.pos, countryId });
        moved = true;
        break;
      }
    }

    if (!moved) {
      for (const [_key, t] of Object.entries(blocked)) {
        stack.push(t);
      }
    } else {
      return true;
    }
  }

  return false;
}

function attackUnit(data: IGameData, tile: ITile, minimumModifier: number) {
  const countryId = tile.unit?.id;
  if (countryId === undefined) return;

  const adjacent = util.getAdjacentTiles(data, tile.pos);

  for (const [_key, t] of Object.entries(adjacent)) {
    if (!t.unit) continue;
    if (t.unit.id === countryId) continue;

    const info = { from: tile.pos, to: t.pos, countryId };
    if (!game.play.moveUnitActable(data, info)) continue;

    if (util.getWarModifier(data, tile, t) > minimumModifier) {
      game.play.moveUnit(data, info);
      break;
    }
  }
}

export const ai = {
  play,
}