"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  useRef,
  useState,
} from "react";

type Transform = { scale: number; x: number; y: number };

/**
 * Wraps any content and makes it pan/zoomable — pinch on touch, wheel/scroll on
 * desktop, drag to pan, plus +/−/reset controls. Handy for dense SVG maps and
 * word clouds that get too small on mobile.
 */
export default function Zoomable({
  children,
  minScale = 1,
  maxScale = 5,
  hint = "Knijp of scroll om te zoomen · sleep om te schuiven",
  accent = "#fff",
  className,
}: {
  children: ReactNode;
  minScale?: number;
  maxScale?: number;
  hint?: string;
  accent?: string;
  className?: string;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState<Transform>({ scale: 1, x: 0, y: 0 });
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; mid: { x: number; y: number } } | null>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  const clamp = (s: number) => Math.min(maxScale, Math.max(minScale, s));
  const local = (clientX: number, clientY: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  // zoom keeping the given local point fixed on screen
  const zoomAround = (nextScale: number, px: number, py: number) =>
    setT((prev) => {
      const s = clamp(nextScale);
      if (s === 1) return { scale: 1, x: 0, y: 0 };
      const k = s / prev.scale;
      return { scale: s, x: px - (px - prev.x) * k, y: py - (py - prev.y) * k };
    });

  const onPointerDown = (e: ReactPointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = local(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
      drag.current = null;
    } else {
      drag.current = { px: p.x, py: p.y, x: t.x, y: t.y };
    }
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, p);

    if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const ratio = dist / pinch.current.dist;
      setT((prev) => {
        const s = clamp(prev.scale * ratio);
        if (s === 1) return { scale: 1, x: 0, y: 0 };
        const k = s / prev.scale;
        // zoom around midpoint + follow the midpoint drift (pan)
        const dx = mid.x - pinch.current!.mid.x;
        const dy = mid.y - pinch.current!.mid.y;
        return {
          scale: s,
          x: mid.x - (mid.x - prev.x) * k + dx,
          y: mid.y - (mid.y - prev.y) * k + dy,
        };
      });
      pinch.current = { dist, mid };
      return;
    }

    if (drag.current && t.scale > 1) {
      const { px, py, x, y } = drag.current;
      setT((prev) => ({ ...prev, x: x + (p.x - px), y: y + (p.y - py) }));
    }
  };

  const endPointer = (e: ReactPointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()];
      drag.current = { px: p.x, py: p.y, x: t.x, y: t.y };
    }
    if (pointers.current.size === 0) drag.current = null;
  };

  const onWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    const p = local(e.clientX, e.clientY);
    zoomAround(t.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), p.x, p.y);
  };

  const onDoubleClick = (e: ReactMouseEvent) => {
    const p = local(e.clientX, e.clientY);
    zoomAround(t.scale > 1 ? 1 : 2.4, p.x, p.y);
  };

  const nudge = (factor: number) => {
    const r = boxRef.current!.getBoundingClientRect();
    zoomAround(t.scale * factor, r.width / 2, r.height / 2);
  };
  const reset = () => setT({ scale: 1, x: 0, y: 0 });

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-sm text-lg leading-none transition hover:bg-black/70";

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={endPointer}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        className="relative w-full overflow-hidden rounded-2xl"
        style={{ touchAction: "none", cursor: t.scale > 1 ? "grab" : "default" }}
      >
        <div
          style={{
            transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
            transformOrigin: "0 0",
            transition: drag.current || pinch.current ? "none" : "transform 0.15s ease-out",
          }}
        >
          {children}
        </div>
      </div>

      {/* controls */}
      <div className="pointer-events-auto absolute right-2 top-2 flex flex-col gap-1.5">
        <button className={btn} onClick={() => nudge(1.4)} aria-label="Inzoomen">
          +
        </button>
        <button className={btn} onClick={() => nudge(1 / 1.4)} aria-label="Uitzoomen">
          −
        </button>
        {t.scale > 1 && (
          <button
            className={`${btn} text-xs`}
            onClick={reset}
            aria-label="Herstellen"
            style={{ color: accent }}
          >
            ⤾
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-[11px] uppercase tracking-widest opacity-45">{hint}</p>
    </div>
  );
}
