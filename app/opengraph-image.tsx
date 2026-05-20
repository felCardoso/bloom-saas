import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bloom — CRM para Revendedoras de Cosméticos";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fff1f2 0%, #fce7f3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo circle */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #f43f5e, #e11d48)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            boxShadow: "0 8px 32px rgba(244,63,94,0.35)",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            {/* lotus petals simplified */}
            <path d="M12 3 Q14 7 12 9 Q10 7 12 3Z" />
            <path d="M12 3 Q16 6 15 9 Q12 8 12 3Z" />
            <path d="M12 3 Q8 6 9 9 Q12 8 12 3Z" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#0f172a",
            letterSpacing: "-2px",
            lineHeight: 1,
            marginBottom: 16,
          }}
        >
          Bloom
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#475569",
            textAlign: "center",
            maxWidth: 680,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          CRM para Revendedoras de Cosméticos
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Clientes", "Pedidos", "Estoque", "Agenda"].map((label) => (
            <div
              key={label}
              style={{
                background: "white",
                border: "1.5px solid #fda4af",
                borderRadius: 999,
                padding: "8px 20px",
                fontSize: 18,
                color: "#e11d48",
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
