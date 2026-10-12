"use client";

import { useEffect, useState } from "react";
import PlimPlim from "./PlimPlim";
import { event } from "@/lib/event";

const AUTO_OPEN_MS = 4500;
const OPEN_ANIMATION_MS = 1900;

type Stage = "closed" | "opening" | "gone";

function Valance() {
  const segments = 10;
  const width = 1000 / segments;
  return (
    <svg className="valance" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden>
      {Array.from({ length: segments }, (_, i) => {
        const x = i * width;
        return (
          <path
            key={i}
            d={`M${x},0 H${x + width} V130 Q${x + width / 2},210 ${x},130 Z`}
            fill={i % 2 === 0 ? "#d62828" : "#ffffff"}
          />
        );
      })}
      <rect x="0" y="0" width="1000" height="28" fill="#fcbf49" />
      {Array.from({ length: 25 }, (_, i) => (
        <circle key={i} cx={20 + i * 40} cy="14" r="6" fill={i % 2 ? "#fff8e7" : "#f77f00"} />
      ))}
    </svg>
  );
}

export default function CircusTent() {
  const [stage, setStage] = useState<Stage>("closed");

  useEffect(() => {
    const html = document.documentElement;
    if (stage === "gone") {
      html.classList.remove("locked");
      return;
    }
    html.classList.add("locked");
    window.scrollTo(0, 0);
  }, [stage]);

  useEffect(() => {
    if (stage !== "closed") return;
    const t = setTimeout(() => setStage("opening"), AUTO_OPEN_MS);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "opening") return;
    const t = setTimeout(() => setStage("gone"), OPEN_ANIMATION_MS);
    return () => clearTimeout(t);
  }, [stage]);

  const open = () => stage === "closed" && setStage("opening");

  return (
    <div
      className={`tent ${stage !== "closed" ? "open" : ""} ${stage === "gone" ? "gone" : ""}`}
      aria-hidden={stage === "gone"}
    >
      <div className="curtain curtain-left" />
      <div className="curtain curtain-right" />
      <Valance />

      <div className="tent-sign flex w-[90vw] max-w-md flex-col items-center text-center">
        <PlimPlim className="animate-bob h-40 w-40 drop-shadow-xl sm:h-52 sm:w-52" />
        <div className="ticket -mt-2 px-6 py-5">
          <p className="font-display text-lg tracking-wide text-circus-blue">¡Damas y caballeros!</p>
          <h1 className="font-display text-3xl leading-tight text-circus-red sm:text-4xl">
            {event.celebrant} cumple {event.age}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{event.tagline}</p>
        </div>
        <button
          onClick={open}
          className="animate-wiggle font-display mt-6 cursor-pointer rounded-full border-4 border-white bg-circus-yellow px-8 py-3 text-xl tracking-wide text-circus-red-dark shadow-[0_6px_0_#9d0208] transition hover:scale-105 active:translate-y-1 active:shadow-[0_2px_0_#9d0208]"
        >
          🎪 Abrir la carpa
        </button>
      </div>
    </div>
  );
}
