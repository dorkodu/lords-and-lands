import { CountryId } from "../types/country_id"

export interface IUnit {
  id: CountryId;
  attacked: boolean;
  moved: boolean;
}

export function createUnit(id: IUnit["id"]): IUnit {
  return {
    id,
    attacked: true,
    moved: true,
  }
}