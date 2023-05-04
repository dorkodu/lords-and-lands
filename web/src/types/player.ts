import { CountryId } from "@core/types/country_id";

export interface IPlayer {
  id: string;
  name: string;
  country: CountryId;
  isAdmin?: boolean;

  isBot?: boolean;
  aggressiveness?: number;
  difficulty?: "easy" | "normal" | "hard";
}