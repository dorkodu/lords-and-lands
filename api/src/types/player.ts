import { ISocket } from "./socket";
import { CountryId } from "@core/types/country_id";

export interface IPlayer {
  id: string;
  name: string;
  lobby: string | undefined;
  country: CountryId;
  socket: ISocket;
}