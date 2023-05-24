import { game } from "../game";
import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
import { ICountry } from "./country";
import { ITile } from "./tile";
import { util } from "./util";

export type IBotSettings = { difficulty: BotDifficulty }
export type BotDifficulty = "easy" | "normal" | "hard";

function convertDifficulty(difficulty: BotDifficulty) {
  switch (difficulty) {
    case "easy": return +0;
    case "normal": return +2;
    case "hard": return +4;
  }
}

function convertAggressiveness(difficulty: BotDifficulty) {
  switch (difficulty) {
    case "easy": return +0;
    case "normal": return +1;
    case "hard": return +2;
  }
}

function play(data: IGameData, countryId: CountryId, settings: IBotSettings) {
  const country = data.countries.filter(c => c.id === countryId)[0];
  if (!country) return;

  const unitTiles: ITile[] = [];
  const bannerTiles: ITile[] = [];
  const emptyOwnTiles: ITile[] = [];
  const chestTiles: ITile[] = [];
  let safety: ReturnType<typeof getTileSafety>[] = [];

  data.tiles.forEach(t => {
    if (t.unit && t.unit.id === countryId) unitTiles.push(t);
    if (t.owner === countryId && t.landmark === LandmarkId.Banner) bannerTiles.push(t);
    if (t.owner === countryId && t.landmark === LandmarkId.None) emptyOwnTiles.push(t);
    if (t.landmark === LandmarkId.Chest) chestTiles.push(t);
  });

  // Bot stages:
  // 1. Place banner
  // 2. Check for chests
  // 3. Move armies away from the banner
  // 4. Move armies to better tiles that have better modifiers
  // 5. Attack if accepted attack modifier level is met

  // 1. Place banner
  if (country.banners > 0) {
    safety = emptyOwnTiles.map(t => getTileSafety(data, t)).sort((a, b) => b.safety - a.safety);
    placeBanner(data, country, safety);
  }

  // 2. Check for chests
  chestTiles.forEach(t => {
    const adjacent = util.getAdjacentTiles(data, t.pos);

    for (let i = 0; i < adjacent.length; ++i) {
      const adjacentTile = adjacent[i];
      if (!adjacentTile) continue;
      if (!(adjacentTile.unit && adjacentTile.unit.id === countryId && !adjacentTile.unit.moved)) continue;

      game.play.moveUnit(data, { from: adjacentTile.pos, to: t.pos, countryId });
      break;
    }
  });
  // After checking for chests, if banner count increased, try to place new banner
  if (country.banners > 0) {
    // If safety is not calculated, calculate it
    if (!safety) safety = emptyOwnTiles.map(t => getTileSafety(data, t)).sort((a, b) => b.safety - a.safety);
    placeBanner(data, country, safety);
  }

  // 3. Move armies away from the banner
  bannerTiles.forEach(t => {
    if (!t.unit || t.unit.id !== countryId) return;
    moveUnitAway(data, t);
  });

  // 4. Move armies to better tiles that have better modifiers

  // 5. Attack if accepted attack modifier level is met
  unitTiles.forEach(t => { attackUnit(data, t, settings) });
}

/**
 * Uses same logic as util.getAdjacentTiles, but this function is tuned for performance.
 * @param data 
 * @param tile 
 * @returns 
 */
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
      const n = util.getTile(data, (x + i), (y - depth));
      if (util.isEnemyTile(n, tile.owner)) return { tile, safety: depth };
      const e = util.getTile(data, (x + depth), (y + i));
      if (util.isEnemyTile(e, tile.owner)) return { tile, safety: depth };
      const s = util.getTile(data, (x + i), (y + depth));
      if (util.isEnemyTile(s, tile.owner)) return { tile, safety: depth };
      const w = util.getTile(data, (x - depth), (y + i));
      if (util.isEnemyTile(w, tile.owner)) return { tile, safety: depth };
    }

    depth++;
  }

  return { tile, safety: -1 };
}

function placeBanner(data: IGameData, country: ICountry, safety: ReturnType<typeof getTileSafety>[]) {
  if (country.banners > 0) {

    while (country.banners > 0 && safety.length > 0) {
      const tile = safety.shift();
      if (!tile) break;

      game.play.placeBanner(data, { countryId: country.id, pos: tile.tile.pos });
    }
  }
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

function attackUnit(data: IGameData, tile: ITile, settings: IBotSettings) {
  const countryId = tile.unit?.id;
  if (countryId === undefined) return;

  const adjacent = util.getAdjacentTiles(data, tile.pos);

  for (const [_key, t] of Object.entries(adjacent)) {
    if (!t.unit) continue;
    if (t.unit.id === countryId) continue;

    const difficulty = convertDifficulty(settings.difficulty);
    const aggressiveness = convertAggressiveness(settings.difficulty);

    const info = { from: tile.pos, to: t.pos, countryId, bonus: difficulty };
    if (!game.play.moveUnitActable(data, info)) continue;

    if (difficulty + aggressiveness > util.getWarModifier(data, tile, t) * -1) {
      game.play.moveUnit(data, info);
      break;
    }
  }
}

export const bot = {
  play,
}