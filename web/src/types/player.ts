import { CountryId } from "@core/types/country_id";

export interface IPlayer {
  id: string | undefined;
  name: string | undefined;
  country: CountryId;
  isAdmin?: boolean;
}