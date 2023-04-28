import { IGameData } from "../gamedata";
import { util } from "../lib/util";
import { CountryId } from "../types/country_id";

type Info = {};

export function startActable(data: IGameData, _info: Info): boolean {
  // If already started
  if (data.running) return false;

  // If less than 2 non-none countries exist
  if (data.countries.filter(c => c.id !== CountryId.None).length < 2) return false;

  return true;
}

export function start(data: IGameData, info: Info) {
  if (!startActable(data, info)) return;

  data.running = true;
  data.turn.type = util.getTurnType(data, data.turn.count);
}