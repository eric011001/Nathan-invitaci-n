import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Imagen de previsualización al compartir el link (WhatsApp, Facebook, etc.).
export const shareImageSize = { width: 1200, height: 630 };

const font = readFile(join(process.cwd(), "src/assets/fonts/LuckiestGuy-Regular.ttf"));
const plimPlim = readFile(join(process.cwd(), "public/plim-plim.png"), "base64");

export async function shareImage({ kicker, title, subtitle }: { kicker: string; title: string; subtitle: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "repeating-linear-gradient(90deg, #d62828 0px, #d62828 70px, #ffffff 70px, #ffffff 140px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: 1080,
            height: 510,
            padding: "0 50px",
            background: "#fff8e7",
            border: "10px dashed #d62828",
            borderRadius: 48,
            boxShadow: "0 18px 0 #9d0208",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse solo acepta <img> */}
          <img src={`data:image/png;base64,${await plimPlim}`} width={380} height={380} alt="" />
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 40, flex: 1 }}>
            <div style={{ fontSize: 40, color: "#1d4e89", letterSpacing: 2 }}>{kicker}</div>
            <div
              style={{
                fontSize: 82,
                lineHeight: 1,
                color: "#d62828",
                marginTop: 12,
                textShadow: "0 6px 0 #fcbf49",
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: 34, color: "#1d4e89", marginTop: 28 }}>{subtitle}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...shareImageSize,
      fonts: [{ name: "Luckiest Guy", data: await font, style: "normal", weight: 400 }],
    },
  );
}
