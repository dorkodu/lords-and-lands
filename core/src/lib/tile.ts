import { TileType } from "../types/tile_type";

export interface ITile {
  pos: { x: number, y: number };
  type: TileType;
}

export function createTile(pos: ITile["pos"]): ITile {
  return {
    pos,
    type: TileType.Nomad,
  }
}