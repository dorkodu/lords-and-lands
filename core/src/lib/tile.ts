import { LandmarkId } from "../types/landmark_id";
import { TileType } from "../types/tile_type";
import { ICountry } from "./country";
import { IUnit } from "./unit";

export interface ITile {
  pos: { x: number, y: number };
  owner: ICountry;

  type: TileType;
  landmark: LandmarkId;
  unit: IUnit | undefined;
}

export function createTile(pos: ITile["pos"], owner: ITile["owner"]): ITile {
  return {
    pos,
    owner,

    type: TileType.Nomad,
    landmark: LandmarkId.None,
    unit: undefined,
  }
}