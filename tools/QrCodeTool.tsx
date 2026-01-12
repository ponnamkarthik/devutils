"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import { QrCode, Download, RefreshCw, Eraser, Settings2 } from "lucide-react";
// @ts-ignore
import QRCode from "react-qr-code";
// @ts-ignore
import { toPng, toSvg } from "html-to-image";

export const QrCodeTool: React.FC = () => {
  const [value, setValue] = useState("https://devutils.app");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("M");
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (format: "png" | "svg") => {
    if (!qrRef.current) return;

    try {
      const dataUrl =
        format === "png"
          ? await toPng(qrRef.current, { backgroundColor: bgColor })
          : await toSvg(qrRef.current, { backgroundColor: bgColor });

      const link = document.createElement("a");
      link.download = `qrcode-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-500/10 text-slate-500 dark:text-slate-400 rounded-lg">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              QR Code Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Generate customizable QR codes for URLs, text, and Wi-Fi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
        {/* Settings Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="flex flex-col gap-5 p-2 border-border/60 shadow-sm h-fit px-0">
            <div className="flex items-center gap-2 text-base font-semibold text-foreground pb-2 border-b border-border/40">
              <Settings2 className="h-5 w-5" /> Configuration
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Content
                </label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  placeholder="Enter text or URL..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Foreground
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="h-9 w-12 rounded border border-input p-0.5 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="h-9 w-12 rounded border border-input p-0.5 cursor-pointer bg-transparent"
                    />
                    <Input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">
                      Size (px)
                    </label>
                    <span className="text-sm text-muted-foreground font-mono">
                      {size}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="128"
                    max="512"
                    step="8"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Error Correction Level
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["L", "M", "Q", "H"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLevel(lvl as any)}
                        className={`py-2 text-sm font-medium rounded-md border transition-all ${
                          level === lvl
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted text-muted-foreground border-input"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Higher levels allow the QR code to be scanned even if
                    damaged, but makes it denser.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setValue("");
                  setFgColor("#000000");
                  setBgColor("#ffffff");
                }}
                className="w-full text-muted-foreground"
              >
                <Eraser className="mr-2 h-4 w-4" /> Reset Defaults
              </Button>
            </div>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-8 flex flex-col h-full">
          <Card className="flex flex-col items-center justify-center p-8 h-full border-border/60 shadow-sm bg-muted/10 relative overflow-hidden">
            {/* Checkerboard Pattern for Transparency feel */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle, currentColor 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />

            <div className="z-10 bg-white p-4 rounded-xl shadow-lg border border-border/20 transition-all duration-300">
              <div ref={qrRef} style={{ background: bgColor, padding: "16px" }}>
                <QRCode
                  value={value}
                  size={size}
                  fgColor={fgColor}
                  bgColor={bgColor}
                  level={level}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8 z-10">
              <Button onClick={() => handleDownload("png")}>
                <Download className="mr-2 h-4 w-4" /> Download PNG
              </Button>
              <Button variant="secondary" onClick={() => handleDownload("svg")}>
                <Download className="mr-2 h-4 w-4" /> Download SVG
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
