"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  return {
    días: Math.floor(ms / 86_400_000),
    horas: Math.floor((ms / 3_600_000) % 24),
    min: Math.floor((ms / 60_000) % 60),
    seg: Math.floor((ms / 1000) % 60),
  };
}

export default function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime();
  const [left, setLeft] = useState<ReturnType<typeof diff> | null>(null);

  useEffect(() => {
    const tick = () => setLeft(diff(target));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [target]);

  return (
    <div className="flex justify-center gap-3 sm:gap-5">
      {Object.entries(left ?? { días: 0, horas: 0, min: 0, seg: 0 }).map(([label, value]) => (
        <div
          key={label}
          className="flex w-18 flex-col items-center rounded-2xl border-4 border-white bg-circus-red py-3 text-white shadow-[0_6px_0_#9d0208] sm:w-24"
        >
          <span className="font-display text-3xl tabular-nums sm:text-5xl">
            {left ? String(value).padStart(2, "0") : "--"}
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase sm:text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}
