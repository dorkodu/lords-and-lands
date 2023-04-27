import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { useLayoutEffect, useState } from "react";
import Tilemap from "./Tilemap";

export default function Map() {
  const [size, setSize] = useState({ x: innerWidth, y: innerHeight });

  useLayoutEffect(() => {
    const onResize = () => { setSize({ x: innerWidth, y: innerHeight }) }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <TransformWrapper
      maxScale={1}
      minScale={0.25}
      centerOnInit={true}
      limitToBounds={false}
    >
      <TransformComponent wrapperStyle={{ width: `${size.x}px`, height: `${size.y}px` }}>
        <Tilemap />
      </TransformComponent>
    </TransformWrapper>
  )
}