import { CountryId } from "../types/country_id"

export interface ICountry {
  id: CountryId;
}

export function createCountry(): ICountry {
  return {
    id: CountryId.None,
  }
}