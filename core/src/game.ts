import { createGameData } from "./gamedata";
import { gameplay } from "./gameplay";
import { parseAction } from "./lib/action_parser";
import { util } from "./lib/util";
import { serializer } from "./serializer";

export const game = {
  play: gameplay,
  util: util,
  serializer: serializer,

  createGameData: createGameData,
  parseAction: parseAction,
}