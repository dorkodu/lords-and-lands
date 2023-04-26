import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import React, { useLayoutEffect, useRef, useState } from "react";
import Tilemap from "./Tilemap";

export default function Map() {
  const [size, setSize] = useState({ x: innerWidth, y: innerHeight });
  const position = useRef({ x: 0, y: 0 });
  const movement = useRef(0);

  const onClick = (_ev: React.MouseEvent) => {
    if (movement.current > 10) return;

    //const element = ev.target as HTMLElement;
  }

  const onMouseDown = (ev: React.MouseEvent) => {
    position.current = { x: ev.nativeEvent.x, y: ev.nativeEvent.y };
    movement.current = 0;
  }
  const onMouseMove = (ev: React.MouseEvent) => {
    movement.current += (
      Math.abs(position.current.x - ev.nativeEvent.x) +
      Math.abs(position.current.y - ev.nativeEvent.y)
    );
    position.current = { x: ev.nativeEvent.x, y: ev.nativeEvent.y };
  }

  const onTouchStart = (ev: React.TouchEvent) => {
    const touch = ev.touches[0];
    position.current = { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
    movement.current = 0;
  }
  const onTouchMove = (ev: React.TouchEvent) => {
    const touch = ev.touches[0];
    if (!touch) return;

    movement.current += (
      Math.abs(position.current.x - touch.clientX) +
      Math.abs(position.current.y - touch.clientY)
    );
    position.current = { x: touch.clientX, y: touch.clientY };
  }

  useLayoutEffect(() => {
    const onResize = () => { setSize({ x: innerWidth, y: innerHeight }) }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <TransformWrapper
      maxScale={10}
      minScale={1}
      initialScale={5}
      centerOnInit={true}
      limitToBounds={false}
      wheel={{ step: 1 }}
    >
      <TransformComponent wrapperStyle={{ width: `${size.x}px`, height: `${size.y}px` }}>
        <div
          onClick={onClick}

          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}

          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
        >
          <Tilemap />
        </div>
      </TransformComponent>
    </TransformWrapper>
  )
}