import { ImageResponse } from "next/og";

export const alt = "Миграционный справочник — инструкции по жизни и работе в России";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f6fa", color: "#1f2c41", padding: 72 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, fontWeight: 800 }}>
        <div style={{ display: "flex", width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "#1f2c41", color: "white" }}>МС</div>
        Миграционный справочник
      </div>
      <div style={{ display: "flex", maxWidth: 980, fontSize: 68, lineHeight: 1.06, fontWeight: 800, letterSpacing: -2 }}>Законный путь к жизни и работе в России</div>
      <div style={{ display: "flex", fontSize: 28, color: "#02629f" }}>Инструкции · документы · официальные источники</div>
    </div>,
    size,
  );
}
