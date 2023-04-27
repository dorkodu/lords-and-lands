import { CountryId } from "../types/country_id"

export interface ICountry {
  id: CountryId;
  banners: number;
}

export function createCountry(id: ICountry["id"]): ICountry {
  return {
    id,
    banners: 1,
  }
}