// Carga a Google Drive con OAuth (refresh token de la cuenta dueña de la carpeta).
// Se usa OAuth en lugar de service account porque las service accounts no tienen
// cuota de almacenamiento en un "Mi unidad" personal.
type DriveConfig = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  folderId: string;
};

export function getDriveConfig(): DriveConfig | null {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!clientId || !clientSecret || !refreshToken || !folderId) return null;
  return { clientId, clientSecret, refreshToken, folderId };
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(config: DriveConfig) {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`No se pudo obtener el token de Google (${res.status})`);

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.value;
}

// Crea una sesión de carga resumible. El navegador sube el archivo directo a la URL
// devuelta, así los videos pesados no pasan por nuestro servidor. Google solo permite
// la subida desde el navegador si la sesión se crea con el mismo Origin.
export async function createUploadSession(
  config: DriveConfig,
  file: { name: string; mimeType: string; size: number; origin: string },
) {
  const token = await getAccessToken(config);
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": file.mimeType,
        "X-Upload-Content-Length": String(file.size),
        Origin: file.origin,
      },
      body: JSON.stringify({ name: file.name, parents: [config.folderId] }),
    },
  );

  const uploadUrl = res.headers.get("location");
  if (!res.ok || !uploadUrl) throw new Error(`Google Drive rechazó la sesión (${res.status})`);
  return uploadUrl;
}
