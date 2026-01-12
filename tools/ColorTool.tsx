"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, Button, Input } from "../components/UI";
import {
  Palette,
  Copy,
  Check,
  RefreshCw,
  Sun,
  Moon,
  AlertTriangle,
} from "lucide-react";
// @ts-ignore
import {
  formatHex,
  formatRgb,
  formatCss,
  wcagContrast,
  converter,
  parse,
  interpolate,
  samples,
} from "culori";

// Converters
const toOklch = converter("oklch");
const toRgb = converter("rgb");
const toP3 = converter("p3");

export const ColorTool: React.FC = () => {
  // State holds the OKLCH values directly for uniform control
  // L: 0 - 1
  // C: 0 - 0.4 (roughly max)
  // H: 0 - 360
  const [l, setL] = useState(0.7);
  const [c, setC] = useState(0.14);
  const [h, setH] = useState(260);
  const [hexInput, setHexInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  // Update hex input when sliders change
  useEffect(() => {
    const color = { mode: "oklch" as const, l, c, h };
    setHexInput(formatHex(color));
  }, [l, c, h]);

  // Handle Hex Input Change
  const handleHexChange = (val: string) => {
    setHexInput(val);
    const parsed = parse(val);
    if (parsed) {
      const oklch = toOklch(parsed);
      if (oklch) {
        setL(oklch.l || 0);
        setC(oklch.c || 0);
        setH(oklch.h || 0);
      }
    }
  };

  // Derived Color Objects
  const colorObj = useMemo(
    () => ({ mode: "oklch" as const, l, c, h }),
    [l, c, h]
  );
  const hexValue = useMemo(() => formatHex(colorObj), [colorObj]);
  const rgbValue = useMemo(() => {
    const rgb = toRgb(colorObj);
    if (!rgb) return "rgb(0,0,0)";
    return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
  }, [colorObj]);
  const oklchCss = `oklch(${Math.round(l * 100)}% ${c.toFixed(3)} ${Math.round(h)})`;
  const p3Css = useMemo(() => {
    const p3 = toP3(colorObj);
    return p3 ? formatCss(p3) : "";
  }, [colorObj]);

  // Contrast Calculations
  const contrastBlack = wcagContrast(colorObj, "#000000");
  const contrastWhite = wcagContrast(colorObj, "#ffffff");

  // Palette Generation (Shades & Tints)
  const palette = useMemo(() => {
    // Generate a scale from very dark to very light preserving Hue
    // We vary Lightness from 0.05 to 0.98, keep Hue, and adjust Chroma slightly
    const results: Array<{ l: number; hex: string; isCurrent: boolean }> = [];
    const steps = 11; // 0 to 10

    for (let i = 0; i < steps; i++) {
      // Linear Lightness distribution
      const stepL = 0.95 - i * (0.9 / (steps - 1));

      // Chroma compensation: high lightness usually supports less chroma
      // We keep hue constant
      const stepColor = { mode: "oklch" as const, l: stepL, c: c, h: h };

      // Clamp for display
      const displayHex = formatHex(stepColor);
      results.push({
        l: stepL,
        hex: displayHex,
        isCurrent: Math.abs(stepL - l) < 0.05, // Approximate match highlight
      });
    }
    return results;
  }, [l, c, h]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  // Helper for sliders background
  const getGradient = (channel: "l" | "c" | "h") => {
    const stops: string[] = [];
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const val = i / numStops;
      let col;
      if (channel === "l") col = { mode: "oklch" as const, l: val, c, h };
      if (channel === "c") col = { mode: "oklch" as const, l, c: val * 0.4, h };
      if (channel === "h") col = { mode: "oklch" as const, l, c, h: val * 360 };
      stops.push(formatHex(col));
    }
    return `linear-gradient(to right, ${stops.join(", ")})`;
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/40">
        <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
          <Palette className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Color Picker (OKLCH)
          </h1>
          <p className="text-xs text-muted-foreground">
            Perceptually uniform color manipulation. Design compatible colors
            easily.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        {/* LEFT COLUMN: Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sliders Card */}
          <Card className="p-0 space-y-6 border-border/60 shadow-md">
            {/* Lightness */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Lightness (L)</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                  {Math.round(l * 100)}%
                </span>
              </div>
              <div className="relative h-6 rounded-full ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: getGradient("l") }}
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={l * 100}
                  onChange={(e) => setL(Number(e.target.value) / 100)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Chroma */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Chroma (C)</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                  {c.toFixed(3)}
                </span>
              </div>
              <div className="relative h-6 rounded-full ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: getGradient("c") }}
                />
                <input
                  type="range"
                  min="0"
                  max="400"
                  value={c * 1000}
                  onChange={(e) => setC(Number(e.target.value) / 1000)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Hue */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Hue (H)</label>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                  {Math.round(h)}°
                </span>
              </div>
              <div className="relative h-6 rounded-full ring-1 ring-black/5 dark:ring-white/10 overflow-hidden">
                <div
                  className="absolute inset-0"
                  style={{ background: getGradient("h") }}
                />
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={h}
                  onChange={(e) => setH(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Hex Input
              </label>
              <div className="flex gap-2">
                <Input
                  value={hexInput}
                  onChange={(e) => handleHexChange(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
                <div
                  className="w-10 h-10 rounded-md shadow-sm border border-border"
                  style={{ backgroundColor: hexValue }}
                />
              </div>
            </div>
          </Card>

          {/* Codes Card */}
          <Card className="flex-1 p-0 border-border/60 shadow-md bg-muted/20 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-border/40">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CSS Output
              </span>
            </div>
            <div className="flex-1 py-4 space-y-3">
              {[
                { label: "Hex", val: hexValue },
                { label: "RGB", val: rgbValue },
                { label: "OKLCH", val: oklchCss },
                { label: "Display P3", val: p3Css },
              ].map((item) => (
                <div key={item.label} className="group relative">
                  <div className="text-[10px] uppercase text-muted-foreground mb-1">
                    {item.label}
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.val, item.label)}
                    className="w-full text-left font-mono text-sm p-2 rounded bg-background border border-border hover:border-primary/50 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate mr-2">{item.val}</span>
                    {copied === item.label ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Visualization */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Main Swatch */}
          <div
            className="w-full h-64 rounded-xl shadow-lg border border-border/20 relative flex flex-col items-center justify-center transition-colors duration-200"
            style={{ backgroundColor: hexValue }}
          >
            <div className="flex gap-8">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl font-bold" style={{ color: "white" }}>
                  Aa
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md">
                  <span className="text-xs font-medium text-white">
                    {contrastWhite.toFixed(2)}
                  </span>
                  {contrastWhite >= 4.5 ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                  )}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl font-bold" style={{ color: "black" }}>
                  Aa
                </span>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md">
                  <span className="text-xs font-medium text-black">
                    {contrastBlack.toFixed(2)}
                  </span>
                  {contrastBlack >= 4.5 ? (
                    <Check className="h-3 w-3 text-emerald-800" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 text-amber-800" />
                  )}
                </div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 text-xs font-medium opacity-50 mix-blend-difference text-white">
              WCAG AA Contrast Check
            </div>
          </div>

          {/* Palette Generator */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                Generated Palette (Lightness Scale)
              </h3>
              <span className="text-xs text-muted-foreground">
                Click to select
              </span>
            </div>

            <div className="grid grid-cols-11 h-24 rounded-xl overflow-hidden shadow-sm border border-border/40">
              {palette.map((swatch, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setL(swatch.l);
                    setHexInput(swatch.hex);
                  }}
                  className="h-full w-full relative group focus:outline-none"
                  style={{ backgroundColor: swatch.hex }}
                  title={`L: ${(swatch.l * 100).toFixed(0)}%`}
                >
                  {/* Hover Info */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span
                      className={`text-[10px] font-bold ${swatch.l > 0.5 ? "text-black/70" : "text-white/70"}`}
                    >
                      {(swatch.l * 100).toFixed(0)}
                    </span>
                  </div>

                  {/* Active Indicator */}
                  {swatch.isCurrent && (
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/50" />
                  )}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 bg-card/50">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  How it works
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This picker uses <strong>OKLCH</strong>, a perceptually
                  uniform color space. Changing Hue doesn't affect perceived
                  lightness, making it perfect for creating accessible color
                  palettes and design systems.
                </p>
              </Card>
              <Card className="p-4 bg-card/50">
                <div className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Browser Support
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Output <code>oklch()</code> and{" "}
                  <code>color(display-p3 ...)</code> work in all modern browsers
                  (Chrome 111+, Safari 15.4+, Firefox 113+). Use Hex/RGB
                  fallbacks for legacy support.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
