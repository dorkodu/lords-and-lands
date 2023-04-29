import { IGameData } from "../gamedata";
import { tilemap } from "../lib/tilemap";
import { ActionId } from "../types/action_id";

type Info = { w: number, h: number, seed: number };
export type IActionGenerate = { id: ActionId.Generate, info: Info };

export function generateActable(data: IGameData, _info: Info): boolean {
  // If already started
  if (data.running) return false;

  return true;
}

export function generate(data: IGameData, info: Info) {
  if (!generateActable(data, info)) return;

  data.width = info.w;
  data.height = info.h;
  data.seed = info.seed;
  data.tiles = [];
  tilemap.generate(data);
}