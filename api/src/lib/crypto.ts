import * as cyptography from "crypto";
import { constants } from "../types/constants";

function id() {
  const bytes = cyptography.randomBytes(constants.lobbyIdLength);
  const string = bytes.toString("base64url").substring(0, 10);
  return string;
}

export const crypto = {
  id,
}