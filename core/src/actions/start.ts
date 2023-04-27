import { IGameData } from "../gamedata";
import { util } from "../lib/util";

type Info = {};

export function startActable(data: IGameData, _info: Info): boolean {
  // If already started
  if (data.running) return false;

  return true;
}

export function start(data: IGameData, info: Info) {
  if (!startActable(data, info)) return;

  data.running = true;
  data.turn.type = util.getTurnType(data, data.turn.count);
}