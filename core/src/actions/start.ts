import { game } from "../game";
import { IGameData } from "../gamedata";
import { util } from "../lib/util";

type Info = {};

export function startActable(data: IGameData, _info: Info): boolean {
  // If already started
  if (data.running) return false;

  // If at least 2 countries must exist
  if (data.countries.length < 2) return false;

  return true;
}

export function start(data: IGameData, info: Info) {
  if (!startActable(data, info)) return;

  // Generate tilemap on start if not generated
  if (data.tiles.length === 0) {
    game.play.generate(data, { w: data.width, h: data.height, seed: data.seed });
  }

  data.running = true;
  data.turn.type = util.getTurnType(data, data.turn.count);
}