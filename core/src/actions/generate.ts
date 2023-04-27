import { IGameData } from "../gamedata";
import { tilemap } from "../lib/tilemap";

type Info = { w: number, h: number };

export function generateActable(data: IGameData, _info: Info): boolean {
  // If already started
  if (data.running) return false;

  return true;
}

export function generate(data: IGameData, info: Info) {
  if (!generateActable(data, info)) return;

  data.width = info.w;
  data.height = info.h;
  tilemap.generate(data);
}