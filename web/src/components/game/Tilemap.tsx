import { useGameStore } from "@/stores/gameStore"
import React from "react";

export default function Tilemap() {
  const tiles = useGameStore(state => state.data.tiles);

  return (
    <>
      {tiles.map((tile, i) => <React.Fragment key={i}>{`x:${tile.pos.x} y:${tile.pos.y} | `}</React.Fragment>)}
    </>
  )
}