import { createGameData } from "./gamedata";
import { gameplay } from "./gameplay";
import { util } from "./lib/util";

export const game = {
  play: gameplay,
  util: util,
  createGameData: createGameData,
}