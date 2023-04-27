import { useEffect, useRef, useState } from "react";

export function useWait<T>(
  start: () => Promise<T>,
  before: number = 100,
  after: number = 500
): () => Promise<T> {
  let out: T;

  return () => new Promise(async (resolve) => {
    let didBefore = false;
    let didAfter = false;
    let loaded = false;

    setTimeout(() => {
      if (loaded) resolve(out);
      didBefore = true;
    }, before);

    setTimeout(() => {
      if (loaded) resolve(out);
      didAfter = true;
    }, after);

    out = await start();

    if (!didBefore || didAfter) resolve(out);
    loaded = true;
  })
}

export function useDelay() {
  const [state, setState] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setState(false), 100);
    return () => clearTimeout(timeout);
  }, []);

  return state;
}

export function useOnClick(event: () => void) {
  const position = useRef({ x: 0, y: 0 });
  const movement = useRef(0);

  const onClick = (_ev: React.MouseEvent) => {
    if (movement.current > 10) return;

    event();
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

  return {
    onClick,
    onMouseDown,
    onMouseMove,
    onTouchStart,
    onTouchMove,
  }
}