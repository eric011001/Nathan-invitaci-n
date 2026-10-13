"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent } from "react";
import CircusNotice from "./CircusNotice";
import { event } from "@/lib/event";
import { MAX_FILE_BYTES, MAX_FILE_MB, SHARED_STORAGE_KEY, mediaKind, type MediaKind } from "@/lib/uploads";

type Status = "pending" | "uploading" | "done" | "error";

type Item = {
  id: string;
  file: File;
  kind: MediaKind;
  url: string;
  status: Status;
  progress: number; // 0 a 1
};

type Toast = { id: number; message: string };

const UNAVAILABLE = "Servicio no disponible, intenta más tarde.";

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
}

// Sube el archivo directo a la sesión resumible de Drive reportando el progreso.
function putFile(url: string, file: File, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(String(xhr.status))));
    xhr.onerror = () => reject(new Error("network"));
    xhr.send(file);
  });
}

async function isServiceAvailable() {
  try {
    const res = await fetch("/api/recuerdos", { cache: "no-store" });
    const data = (await res.json()) as { available?: boolean };
    return res.ok && data.available === true;
  } catch {
    return false;
  }
}

function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// null en el servidor: aún no sabemos si este dispositivo ya compartió.
function useAlreadyShared() {
  return useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(SHARED_STORAGE_KEY) === "1",
    () => null,
  );
}

export default function MemoriesUploader() {
  const alreadyShared = useAlreadyShared();
  const [justShared, setJustShared] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const showToast = useCallback((message: string) => setToast({ id: Date.now(), message }), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  // Libera las previsualizaciones al salir de la página.
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  // Evita que cierren la página a media carga.
  useEffect(() => {
    if (!uploading) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [uploading]);

  const queued = items.filter((i) => i.status !== "done");
  const photos = queued.filter((i) => i.kind === "photo").length;
  const videos = queued.length - photos;

  const batch = uploading ? items : [];
  const totalBytes = batch.reduce((sum, i) => sum + i.file.size, 0);
  const sentBytes = batch.reduce((sum, i) => sum + i.file.size * (i.status === "done" ? 1 : i.progress), 0);
  const overall = totalBytes ? sentBytes / totalBytes : 0;
  const doneCount = items.filter((i) => i.status === "done").length;

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = "";

    let tooBig = 0;
    let unsupported = 0;
    const next: Item[] = [];
    for (const file of picked) {
      const kind = mediaKind(file.name, file.type);
      if (!kind) unsupported++;
      else if (file.size > MAX_FILE_BYTES) tooBig++;
      else
        next.push({
          id: crypto.randomUUID(),
          file,
          kind,
          url: URL.createObjectURL(file),
          status: "pending",
          progress: 0,
        });
    }

    if (tooBig) showToast(`${plural(tooBig, "archivo supera", "archivos superan")} los ${MAX_FILE_MB} MB y no se agregó.`);
    else if (unsupported) showToast("Solo puedes subir fotos y videos.");

    setItems((prev) => [...prev.filter((i) => i.status !== "done"), ...next]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((i) => i.id !== id);
    });
  }

  function patch(id: string, changes: Partial<Item>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)));
  }

  async function startUpload() {
    setConfirming(false);
    if (!(await isServiceAvailable())) {
      showToast(UNAVAILABLE);
      return;
    }

    setUploading(true);
    let failed = 0;

    // Uno por uno: más estable en datos móviles que varios en paralelo.
    for (const item of itemsRef.current.filter((i) => i.status !== "done")) {
      patch(item.id, { status: "uploading", progress: 0 });
      try {
        const res = await fetch("/api/recuerdos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: item.file.name, type: item.file.type, size: item.file.size }),
        });
        if (res.status === 503) {
          patch(item.id, { status: "pending", progress: 0 });
          showToast(UNAVAILABLE);
          setUploading(false);
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const { uploadUrl } = (await res.json()) as { uploadUrl: string };
        await putFile(uploadUrl, item.file, (progress) => patch(item.id, { progress }));
        patch(item.id, { status: "done", progress: 1 });
      } catch {
        failed++;
        patch(item.id, { status: "error", progress: 0 });
      }
    }

    setUploading(false);
    if (!failed) {
      localStorage.setItem(SHARED_STORAGE_KEY, "1");
      setJustShared(true);
      return;
    }
    showToast(`${plural(failed, "archivo no se pudo", "archivos no se pudieron")} subir. Vuelve a intentarlo.`);
  }

  if (alreadyShared === null) return null;

  if (alreadyShared || justShared) {
    return (
      <CircusNotice icon="🎉" title="¡Gracias por compartir estos momentos!">
        {event.celebrant} te lo agradece mucho, y también que hayas pasado con él este día tan especial. 💛
      </CircusNotice>
    );
  }

  return (
    <div className="mx-auto mt-2 max-w-3xl">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-4xl leading-none text-circus-red drop-shadow-[0_3px_0_#fcbf49] sm:text-6xl">
          ¡Comparte tus recuerdos!
        </h1>
        <p className="mt-4 text-lg text-slate-700">
          Gracias por venir a la función. Sube aquí las fotos y videos que tomaste para que {event.celebrant} pueda
          verlos cuando sea grande.
        </p>
      </div>

      {!uploading && (
        <div className="mt-10">
          <input
            id="recuerdos-input"
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onPick}
            className="sr-only"
          />
          <label
            htmlFor="recuerdos-input"
            className="circus-drop block cursor-pointer rounded-3xl p-1.5 text-center transition hover:scale-[1.01] active:scale-[0.98]"
          >
            <span className="flex flex-col items-center rounded-[1.25rem] border-4 border-dashed border-circus-yellow bg-circus-cream px-6 py-10">
              <span className="animate-bob text-6xl" aria-hidden>
                🎪
              </span>
              <span className="font-display mt-3 text-2xl tracking-wide text-circus-red sm:text-3xl">
                {items.length ? "Agregar más fotos y videos" : "Toca aquí para elegir tus fotos y videos"}
              </span>
              <span className="mt-2 text-slate-600">📸 Fotos y 🎬 videos · máximo {MAX_FILE_MB} MB por archivo</span>
            </span>
          </label>
        </div>
      )}

      {uploading && (
        <div className="ticket mt-10 p-5" role="status" aria-live="polite">
          <p className="font-display text-center text-xl tracking-wide text-circus-blue">
            ¡La función está en marcha! {doneCount} de {batch.length}
          </p>
          <ProgressBar value={overall} />
          <p className="mt-2 text-center text-sm text-slate-600">No cierres esta página hasta que termine.</p>
        </div>
      )}

      {items.length > 0 && (
        <ul className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => (
            <Preview key={item.id} item={item} disabled={uploading} onRemove={() => remove(item.id)} />
          ))}
        </ul>
      )}

      {queued.length > 0 && !uploading && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t-4 border-circus-yellow bg-circus-blue/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
            <p className="text-sm text-white sm:text-base">
              {plural(photos, "foto", "fotos")} · {plural(videos, "video", "videos")}
            </p>
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="font-display rounded-full bg-circus-red px-6 py-3 text-lg tracking-wide text-white shadow-[0_5px_0_#9d0208] transition active:translate-y-1 active:shadow-none"
            >
              Cargar archivos 🎈
            </button>
          </div>
        </div>
      )}

      {confirming && (
        <ConfirmDialog photos={photos} videos={videos} onCancel={() => setConfirming(false)} onConfirm={startUpload} />
      )}

      {toast && (
        <div
          key={toast.id}
          role="alert"
          className="circus-toast fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border-4 border-circus-yellow bg-circus-red p-4 text-white shadow-[0_6px_0_#9d0208]"
        >
          <span className="text-3xl" aria-hidden>
            🤡
          </span>
          <p className="flex-1 font-semibold">
            <span className="font-display mr-1 tracking-wide text-circus-yellow">¡Ups!</span>
            {toast.message}
          </p>
          <button type="button" onClick={() => setToast(null)} aria-label="Cerrar aviso" className="text-2xl leading-none">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="relative mt-4 pt-2">
      <div
        className="h-8 overflow-hidden rounded-full border-4 border-circus-blue bg-circus-cream"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className="circus-progress h-full rounded-full transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
      <span
        className="absolute top-0 -translate-x-1/2 text-3xl transition-[left] duration-300"
        style={{ left: `clamp(1rem, ${pct}%, calc(100% - 1rem))` }}
        aria-hidden
      >
        🎈
      </span>
      <p className="font-display mt-2 text-center text-2xl text-circus-red">{pct}%</p>
    </div>
  );
}

function Preview({ item, disabled, onRemove }: { item: Item; disabled: boolean; onRemove: () => void }) {
  return (
    <li className="relative aspect-square overflow-hidden rounded-2xl border-4 border-white bg-slate-200 shadow-[0_4px_0_#9d0208]">
      {item.kind === "photo" ? (
        // eslint-disable-next-line @next/next/no-img-element -- previsualización local (blob:)
        <img src={item.url} alt={item.file.name} className="h-full w-full object-cover" />
      ) : (
        // #t=0.1 hace que iOS muestre el primer cuadro del video
        <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
      )}

      {item.kind === "video" && (
        <span className="absolute bottom-1 left-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">🎬 video</span>
      )}

      {item.status === "uploading" && (
        <div className="absolute inset-x-1 bottom-1 h-2 overflow-hidden rounded-full bg-white/70">
          <div className="circus-progress h-full" style={{ width: `${Math.round(item.progress * 100)}%` }} />
        </div>
      )}
      {item.status === "done" && (
        <span className="absolute inset-0 flex items-center justify-center bg-circus-blue/50 text-4xl">✅</span>
      )}
      {item.status === "error" && (
        <span className="absolute inset-0 flex items-center justify-center bg-circus-red/60 text-sm font-bold text-white">
          Reintentar
        </span>
      )}

      {!disabled && item.status !== "done" && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${item.file.name}`}
          className="absolute top-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-circus-red text-lg leading-none text-white shadow"
        >
          ×
        </button>
      )}
    </li>
  );
}

function ConfirmDialog({
  photos,
  videos,
  onCancel,
  onConfirm,
}: {
  photos: number;
  videos: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center" onClick={onCancel}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="circus-pop ticket w-full max-w-md overflow-hidden text-center"
      >
        <div className="circus-awning h-6" aria-hidden />
        <div className="p-6">
          <span className="text-5xl" aria-hidden>
            🎩
          </span>
          <h2 id="confirm-title" className="font-display mt-2 text-3xl tracking-wide text-circus-red">
            ¿Listo para la función?
          </h2>
          <p className="mt-3 text-lg text-slate-700">Estás por subir:</p>
          <div className="mt-3 flex justify-center gap-4">
            <span className="rounded-2xl bg-circus-cream px-4 py-2">
              <span className="font-display block text-3xl text-circus-blue">{photos}</span>
              📸 {photos === 1 ? "foto" : "fotos"}
            </span>
            <span className="rounded-2xl bg-circus-cream px-4 py-2">
              <span className="font-display block text-3xl text-circus-blue">{videos}</span>
              🎬 {videos === 1 ? "video" : "videos"}
            </span>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            Una vez cargados <strong>no podrás borrarlos</strong>. ¿Estás seguro de que quieres compartir estos
            archivos?
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={onConfirm}
              className="font-display rounded-full bg-circus-red px-6 py-3 text-lg tracking-wide text-white shadow-[0_5px_0_#9d0208] transition active:translate-y-1 active:shadow-none"
            >
              ¡Sí, que empiece el show! 🎪
            </button>
            <button type="button" onClick={onCancel} className="py-2 font-semibold text-circus-blue">
              Mejor los reviso otra vez
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
