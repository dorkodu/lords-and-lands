import { CountryId } from "@core/types/country_id";

export interface INetworkPlayer {
  id: string;
  name: string;
  country: CountryId;
}