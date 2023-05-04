import { game } from "../game";
import { IGameData } from "../gamedata";
import { CountryId } from "../types/country_id";
import { LandmarkId } from "../types/landmark_id";
import { ITile } from "./tile";
import { util } from "./util";

function play(data: IGameData, countryId: CountryId) {
  const country = data.countries.filter(c => c.id === countryId)[0];
  if (!country) return;

  // Use as -> unitTiles["5:2"], (x,y) = (5,2)
  const unitTiles = {} as Record<string, ITile>;
  const bannerTiles: ITile[] = [];
  const emptyOwnTiles: ITile[] = [];

  data.tiles.forEach(t => {
    if (t.unit && t.unit.id === countryId) unitTiles[`${t.pos.x}:${t.pos.y}`] = t;
    if (t.owner === countryId && t.landmark === LandmarkId.Banner) bannerTiles.push(t);
    if (t.owner === countryId && t.landmark === LandmarkId.None) emptyOwnTiles.push(t);
  });

  // AI stages:
  // 1. Place banner
  // 2. Move armies away from the banner
  // 3. Move armies to better tiles that have better modifiers
  // 4. Attack if rng accepted "safety" level is met
  // 5. Next turn

  // 1. Place banner
  if (country.banners > 0) {
    const safety = emptyOwnTiles.map(t => getTileSafety(data, t)).sort((a, b) => b.safety - a.safety);

    while (country.banners > 0 && safety.length > 0) {
      const tile = safety.shift();
      if (!tile) break;

      game.play.placeBanner(data, { countryId, pos: tile.tile.pos });
    }
  }
}

function getTileSafety(data: IGameData, tile: ITile): { tile: ITile, safety: number } {
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

export const ai = {
  play,
  getTileSafety,
}