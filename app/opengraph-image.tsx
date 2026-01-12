import Image from "next/image";
import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: 80,
        background: "hsl(222 84% 5%)",
        color: "hsl(214 32% 91%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -200,
          background:
            "radial-gradient(circle at 20% 30%, hsla(160, 84%, 39%, 0.18), transparent 55%), radial-gradient(circle at 80% 65%, hsla(215, 20%, 65%, 0.10), transparent 50%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            <svg
              width="56"
              height="56"
              viewBox="0 0 1024 1024"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="1024" height="1024" rx="262" fill="#061B22" />
              <path
                d="M632 512L297.08 846.92C281.167 862.833 259.584 871.773 237.08 871.773C214.576 871.773 192.993 862.833 177.08 846.92C161.167 831.007 152.227 809.424 152.227 786.92C152.227 764.416 161.167 742.833 177.08 726.92L512 392"
                stroke="#10B77F"
                stroke-width="28"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M752 632L912 472"
                stroke="#10B77F"
                stroke-width="28"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M892 492L815.44 415.44C800.436 400.441 792.005 380.096 792 358.88V312L701.6 221.6C656.982 177.007 596.601 151.774 533.52 151.36L392 150.4L428.8 183.2C454.938 206.376 475.868 234.828 490.209 266.682C504.55 298.535 511.977 333.067 512 368V432L592 512H638.879C660.095 512.004 680.44 520.436 695.44 535.44L772 612"
                stroke="#10B77F"
                stroke-width="28"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          {/* <img
            className="h-14 w-14"
            src="/icon.svg"
            alt="DevUtils"
            width={56}
            height={56}
          /> */}
          <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
            <span style={{ fontSize: 36, fontWeight: 800 }}>DevUtils</span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "hsl(215 16% 47%)",
              }}
            >
              Offline
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: 34,
            fontSize: 68,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -1.5,
          }}
        >
          Developer Tools &amp; Utilities
        </div>

        <div
          style={{
            marginTop: 18,
            fontSize: 28,
            color: "hsl(215 20% 65%)",
            lineHeight: 1.35,
            maxWidth: 980,
          }}
        >
          Format • Convert • Encode • Debug — fast, private, and in-browser.
        </div>

        <div
          style={{ marginTop: 42, display: "flex", gap: 12, flexWrap: "wrap" }}
        >
          {["No uploads", "Private", "Fast", "Offline-first"].map((pill) => (
            <div
              key={pill}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid hsl(215 28% 17%)",
                background: "hsl(215 28% 17%)",
                color: "hsl(214 32% 91%)",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...size,
    }
  );
}
