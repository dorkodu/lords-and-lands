import { IGameData } from "../gamedata";

type Info = {};

export function moveUnitActable(data: IGameData, _info: Info): boolean {
  return true;
}

export function moveUnit(data: IGameData, info: Info) {
  if (!moveUnitActable(data, info)) return;
}