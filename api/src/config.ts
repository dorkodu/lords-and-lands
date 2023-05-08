import { util } from "./lib/util";

const epochTime = util.parseNumber(process.env.EPOCH_TIME) || 1672531200069;
const machineId = util.parseNumber(process.env.MACHINE_ID) || 0;

const postgresHost = process.env.POSTGRES_HOST || "lordsandlands_postgres";
const postgresPort = util.parseNumber(process.env.PGPORT) || 7004;
const postgresName = process.env.POSTGRES_DB || "lordsandlands";
const postgresUser = process.env.POSTGRES_USER || "postgres";
const postgresPassword = process.env.POSTGRES_PASSWORD || "postgres";

const port = util.parseNumber(process.env.PORT) || 8009;
const env: "development" | "production" = (
  process.env.NODE_ENV === "development" || process.env.NODE_ENV === "production"
) && process.env.NODE_ENV || "development";

export const config = {
  epochTime,
  machineId,

  postgresHost,
  postgresPort,
  postgresName,
  postgresUser,
  postgresPassword,

  port,
  env,
}