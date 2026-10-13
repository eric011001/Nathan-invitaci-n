import { connection, type NextRequest } from "next/server";
import { createUploadSession, getDriveConfig } from "@/lib/drive";
import { isRemembersActive } from "@/lib/remembers";
import { MAX_FILE_BYTES, mediaKind } from "@/lib/uploads";

const unavailable = () => Response.json({ error: "unavailable" }, { status: 503 });

// Indica si el servicio de carga está configurado.
export async function GET() {
  await connection();
  return Response.json({ available: isRemembersActive() && getDriveConfig() !== null });
}

// Crea una sesión de carga en Drive para un solo archivo.
export async function POST(request: NextRequest) {
  const config = getDriveConfig();
  if (!config || !isRemembersActive()) return unavailable();

  const body = (await request.json().catch(() => null)) as {
    name?: unknown;
    type?: unknown;
    size?: unknown;
  } | null;
  const name = typeof body?.name === "string" ? body.name : "";
  const type = typeof body?.type === "string" ? body.type : "";
  const size = typeof body?.size === "number" ? body.size : 0;

  if (!name || !mediaKind(name, type)) {
    return Response.json({ error: "Solo se permiten fotos y videos" }, { status: 400 });
  }
  if (size <= 0 || size > MAX_FILE_BYTES) {
    return Response.json({ error: "Archivo demasiado grande" }, { status: 413 });
  }

  const origin = request.headers.get("origin") ?? request.nextUrl.origin;
  const safeName = `${new Date().toISOString().replace(/[:.]/g, "-")}_${name.replace(/[\\/]/g, "_").slice(0, 150)}`;

  try {
    const uploadUrl = await createUploadSession(config, {
      name: safeName,
      mimeType: type || "application/octet-stream",
      size,
      origin,
    });
    return Response.json({ uploadUrl });
  } catch (error) {
    console.error("[recuerdos]", error);
    return unavailable();
  }
}
