// Reglas compartidas entre el cliente y el servidor para la carga de recuerdos.
export const MAX_FILE_MB = 75;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

export type MediaKind = "photo" | "video";

const PHOTO_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|webm|3gp|avi|mkv)$/i;

// Algunos teléfonos (p. ej. fotos HEIC) entregan el archivo sin MIME type, por eso
// también se revisa la extensión.
export function mediaKind(name: string, type: string): MediaKind | null {
  if (type.startsWith("image/") || PHOTO_EXT.test(name)) return "photo";
  if (type.startsWith("video/") || VIDEO_EXT.test(name)) return "video";
  return null;
}

// Llave en localStorage que marca que este dispositivo ya compartió sus recuerdos.
export const SHARED_STORAGE_KEY = "recuerdos-compartidos";
