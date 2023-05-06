import { ISocket } from "./socket";
import { CountryId } from "@core/types/country_id";
import { IBotSettings } from "@core/lib/bot";

export interface IPlayer {
  id: string;
  name: string;
  country: CountryId;

  lobby: string | undefined;
  socket: ISocket | undefined;

  bot?: IBotSettings;
  local?: { ownerId: string };
}

export interface INetworkPlayer {
  id: string;
  name: string;
  country: CountryId;

  bot?: IBotSettings;
  local?: { ownerId: string };
}