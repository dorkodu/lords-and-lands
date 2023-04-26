import { IGameData } from "../gamedata";
import { createTile } from "../lib/tile";
import { LandmarkId } from "../types/landmark_id";

export function generate(data: IGameData, width: number, height: number) {
  const origins = chooseOrigins(data, width, height);
  chooseTiles(data, width, height, origins);
  sprinkleNature(data, width, height);
}

function chooseOrigins(data: IGameData, width: number, height: number) {
  const origins: { x: number, y: number }[][] = [];

  for (let i = 0; i < data.countries.length; ++i) {
    origins[i] = [{ x: data.rng.number(0, width), y: data.rng.number(0, height) }];

    for (let j = i - 1; j >= 0; --j) {
      if (origins[j]![0]!.x === origins[i]![0]!.x && origins[j]![0]!.y === origins[i]![0]!.y) {
        --i;
        break;
      }
    }
  }

  for (let i = 0; i < data.countries.length; ++i) {
    data.tiles[origins[i]![0]!.x + origins[i]![0]!.y * width] = createTile(
      { x: origins[i]![0]!.x, y: origins[i]![0]!.y },
      data.countries[i]!
    );
  }

  return origins;
}

function chooseTiles(
  data: IGameData,
  width: number,
  height: number,
  origins: { x: number, y: number }[][]
) {
  let emptyTilesLeft = true;
  while (emptyTilesLeft) {
    emptyTilesLeft = false;

    for (let countryId = 0; countryId < data.countries.length; ++countryId) {
      if (origins[countryId]!.length === 0) continue;

      const originX = origins[countryId]![0]!.x;
      const originY = origins[countryId]![0]!.y;

      const upIndex = (originX) + (originY - 1) * width;
      const rightIndex = (originX + 1) + (originY) * width;
      const downIndex = (originX) + (originY + 1) * width;
      const leftIndex = (originX - 1) + (originY) * width;

      if (originY - 1 > -1 && !data.tiles[upIndex]) {
        origins[countryId]!.push({ x: originX, y: originY - 1 })
        data.tiles[upIndex] = createTile({ x: originX, y: originY - 1 }, data.countries[countryId]!);
      } else if (originX + 1 < width && !data.tiles[rightIndex]) {
        origins[countryId]!.push({ x: originX + 1, y: originY })
        data.tiles[rightIndex] = createTile({ x: originX + 1, y: originY }, data.countries[countryId]!);
      } else if (originY + 1 < height && !data.tiles[downIndex]) {
        origins[countryId]!.push({ x: originX, y: originY + 1 })
        data.tiles[downIndex] = createTile({ x: originX, y: originY + 1 }, data.countries[countryId]!);
      } else if (originX - 1 > -1 && !data.tiles[leftIndex]) {
        origins[countryId]!.push({ x: originX - 1, y: originY })
        data.tiles[leftIndex] = createTile({ x: originX - 1, y: originY }, data.countries[countryId]!);
      } else {
        origins[countryId]!.splice(0, 1);
      }

      emptyTilesLeft = emptyTilesLeft || origins[countryId] as unknown as number !== 0;
    }
  }
}

function sprinkleNature(data: IGameData, width: number, height: number) {
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const tile = data.tiles[x + y * width];
      const landmark = data.rng.percent([
        { percent: 10, result: LandmarkId.Mountains },
        { percent: 15, result: LandmarkId.Forest },
        { percent: 75, result: LandmarkId.None }
      ])

      if (tile && landmark) tile.landmark = landmark;
    }
  }
}