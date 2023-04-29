import { createGameData } from "./gamedata";
import { gameplay } from "./gameplay";
import { parseAction } from "./lib/action_parser";
import { util } from "./lib/util";

export const game = {
  play: gameplay,
  util: util,

  createGameData: createGameData,
  parseAction: parseAction,
}