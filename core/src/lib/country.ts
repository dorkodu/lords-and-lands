import { CountryId } from "../types/country_id"

export interface ICountry {
  id: CountryId;
}

export function createCountry(id: ICountry["id"]): ICountry {
  return {
    id,
  }
}