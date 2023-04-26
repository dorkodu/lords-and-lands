import { useGameStore } from "@/stores/gameStore"

export default function Tilemap() {
  const tiles = useGameStore(state => state.data.tiles);

  return (
    <>
      {tiles.map(tile => <>{tile.pos}</>)}
    </>
  )
}