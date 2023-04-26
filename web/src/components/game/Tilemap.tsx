import { useGameStore } from "@/stores/gameStore"
import { ITile } from "@core/lib/tile";

import TileSettled from "@/assets/tiles/green_settled.png";

export default function Tilemap() {
  const tiles = useGameStore(state => state.data.tiles);

  return (
    <>
      {tiles.map((tile, i) => <Tile tile={tile} key={i} />)}
    </>
  )
}

function Tile({ tile }: { tile: ITile }) {
  return (
    <>
      <img
        src={TileSettled}
        style={{ position: "absolute", transform: `translate(${tile.pos.x * 128}px, ${tile.pos.y * 128}px)` }}
      />
    </>
  )
}