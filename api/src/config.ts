import { util } from "./lib/util";

const port = util.parseNumber(process.env.PORT) || 9000;
const env: "development" | "production" = (
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production"
) && process.env.NODE_ENV || "development";

export const config = {
  port,
  env,
}