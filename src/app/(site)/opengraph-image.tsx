import { ImageResponse } from "next/og";
// Import the raw Lucide path data so the edge OG renderer does not pull in
// lucide-react's client-only context implementation.
// @ts-expect-error lucide-react exposes the icon node at this internal path,
// but does not ship a declaration for the generated icon module.
import { __iconNode as rawCompassIconNode } from "lucide-react/dist/esm/icons/compass.js";

type CompassIconAttributes = { key?: string; [attribute: string]: string | undefined };
const compassIconNode = rawCompassIconNode as readonly (readonly [string, CompassIconAttributes])[];

export const runtime = "edge";
export const alt = "Миграционный справочник — инструкции по жизни и работе в России";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f4f6fa", color: "#1f2c41", padding: 72 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 30, fontWeight: 800 }}>
        <div style={{ display: "flex", width: 64, height: 64, alignItems: "center", justifyContent: "center", borderRadius: 16, background: "#c8aa70", color: "#17201d" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            {compassIconNode.map(([tag, attributes]) => {
              const { key, ...props } = attributes;
              return tag === "circle"
                ? <circle key={key} {...props} />
                : <path key={key} {...props} />;
            })}
          </svg>
        </div>
        Миграционный справочник
      </div>
      <div style={{ display: "flex", maxWidth: 980, fontSize: 68, lineHeight: 1.06, fontWeight: 800, letterSpacing: -2 }}>Законный путь к жизни и работе в России</div>
      <div style={{ display: "flex", fontSize: 28, color: "#02629f" }}>Инструкции · документы · официальные источники</div>
    </div>,
    size,
  );
}
