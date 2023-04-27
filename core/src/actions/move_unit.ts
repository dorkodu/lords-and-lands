import { IGameData } from "../gamedata";

type Info = {
  from: { x: number, y: number };
  to: { x: number, y: number };
}

export function moveUnitActable(data: IGameData, _info: Info): boolean {
  return true;
}

export function moveUnit(data: IGameData, info: Info) {
  if (!moveUnitActable(data, info)) return;
}