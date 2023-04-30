import * as cyptography from "crypto";
import { constants } from "../types/constants";

function id() {
  const bytes = cyptography.randomBytes(constants.lobbyIdLength);
  const string = bytes.toString("base64url").substring(0, 10);
  return string;
}

function seed() {
  // 281474976710655 = ( 2^48 ) - 1
  return cyptography.randomInt(281474976710655);
}

export const crypto = {
  id,
  seed,
}