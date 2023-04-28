import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { useLayoutEffect, useState } from "react";
import Tilemap from "./Tilemap";
import { useGameStore } from "@/stores/gameStore";

export default function Map() {
  const [size, setSize] = useState({ x: innerWidth, y: innerHeight });

  useLayoutEffect(() => {
    const onResize = () => { setSize({ x: innerWidth, y: innerHeight }) }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <TransformWrapper
      initialPositionX={useGameStore.getState().map.positionX}
      initialPositionY={useGameStore.getState().map.positionY}
      initialScale={useGameStore.getState().map.scale}

      maxScale={1}
      minScale={0.25}

      limitToBounds={false}
      doubleClick={{ disabled: true }}

      onTransformed={(_ref, state) => { useGameStore.setState(s => { s.map = state }) }}
    >
      <TransformComponent wrapperStyle={{ width: `${size.x}px`, height: `${size.y}px` }}>
        <Tilemap />
      </TransformComponent>
    </TransformWrapper>
  )
}