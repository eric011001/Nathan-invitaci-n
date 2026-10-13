"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { event, type RsvpContact } from "@/lib/event";

const MAX_GUESTS = 20;

function whatsappUrl(phone: string, guests: number) {
  const who =
    guests === 1 ? "Asistirá 1 persona" : `Asistiremos ${guests} personas`;
  const text = `¡Hola! Confirmo mi asistencia a la fiesta de ${event.celebrant} 🎪. ${who}.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default function RsvpButton({ rsvp }: { rsvp: RsvpContact }) {
  const [open, setOpen] = useState(false);
  // Texto para permitir borrar el campo mientras escriben.
  const [value, setValue] = useState("1");

  const guests = Number(value);
  const valid = Number.isInteger(guests) && guests >= 1 && guests <= MAX_GUESTS;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const step = (delta: number) =>
    setValue(
      String(Math.min(MAX_GUESTS, Math.max(1, (valid ? guests : 1) + delta))),
    );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-display inline-block rounded-full border-4 border-white bg-[#25d366] px-10 py-4 text-2xl tracking-wide text-white shadow-[0_6px_0_#128c7e] transition hover:scale-105"
      >
        ✅ Confirmar por WhatsApp
      </button>

      {/* Portal: el contenedor animado de Reveal rompería el position: fixed */}
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="rsvp-title"
              onClick={(e) => e.stopPropagation()}
              className="circus-pop ticket w-full max-w-md overflow-hidden text-center"
            >
              <div className="circus-awning h-6" aria-hidden />
              <div className="p-6">
                <span className="text-5xl" aria-hidden>
                  🎟️
                </span>
                <h2
                  id="rsvp-title"
                  className="font-display mt-2 text-3xl tracking-wide text-circus-red"
                >
                  ¿Cuántos vienen a la función?
                </h2>
                <p className="mt-2 text-slate-600">
                  Cuéntanos cuántas personas asistirán, contándote a ti.
                </p>

                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    disabled={valid && guests <= 1}
                    aria-label="Una persona menos"
                    className="font-display h-14 w-14 rounded-full bg-circus-blue text-3xl text-white shadow-[0_4px_0_#0b2545] transition active:translate-y-1 active:shadow-none disabled:opacity-40"
                  >
                    −
                  </button>
                  <label className="sr-only" htmlFor="rsvp-guests">
                    Número de personas
                  </label>
                  <input
                    id="rsvp-guests"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={MAX_GUESTS}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="font-display h-20 w-24 rounded-2xl border-4 border-dashed border-circus-yellow bg-circus-cream text-center text-5xl text-circus-red outline-none focus:border-circus-red [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <button
                    type="button"
                    onClick={() => step(1)}
                    disabled={valid && guests >= MAX_GUESTS}
                    aria-label="Una persona más"
                    className="font-display h-14 w-14 rounded-full bg-circus-blue text-3xl text-white shadow-[0_4px_0_#0b2545] transition active:translate-y-1 active:shadow-none disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
                <p
                  className={`mt-2 text-sm ${valid ? "text-slate-500" : "font-semibold text-circus-red"}`}
                >
                  {valid
                    ? guests === 1
                      ? "persona"
                      : "personas"
                    : `Escribe un número del 1 al ${MAX_GUESTS}`}
                </p>

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={
                      valid ? whatsappUrl(rsvp.whatsapp, guests) : undefined
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={!valid}
                    onClick={(e) =>
                      valid ? setOpen(false) : e.preventDefault()
                    }
                    className={`font-display rounded-full bg-[#25d366] px-6 py-3 text-lg tracking-wide text-white shadow-[0_5px_0_#128c7e] transition active:translate-y-1 active:shadow-none ${valid ? "" : "pointer-events-none opacity-50"}`}
                  >
                    Enviar confirmación
                  </a>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="py-2 font-semibold text-circus-blue"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
