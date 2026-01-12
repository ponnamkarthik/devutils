"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import {
  Ruler,
  Copy,
  Check,
  Settings2,
  ArrowRightLeft,
  Monitor,
  Type,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type UnitCategory = "absolute" | "relative" | "viewport";

interface UnitDef {
  id: string;
  label: string;
  category: UnitCategory;
  toPx: (val: number, ctx: Context) => number;
  fromPx: (px: number, ctx: Context) => number;
}

interface Context {
  baseFontSize: number;
  viewportWidth: number;
  viewportHeight: number;
}

const UNITS: UnitDef[] = [
  // Absolute / Fixed
  {
    id: "px",
    label: "Pixels (px)",
    category: "absolute",
    toPx: (v) => v,
    fromPx: (px) => px,
  },
  {
    id: "pt",
    label: "Points (pt)",
    category: "absolute",
    toPx: (v) => v * (96 / 72),
    fromPx: (px) => px * (72 / 96),
  },
  {
    id: "pc",
    label: "Picas (pc)",
    category: "absolute",
    toPx: (v) => v * 16,
    fromPx: (px) => px / 16,
  },
  {
    id: "in",
    label: "Inches (in)",
    category: "absolute",
    toPx: (v) => v * 96,
    fromPx: (px) => px / 96,
  },
  {
    id: "cm",
    label: "Centimeters (cm)",
    category: "absolute",
    toPx: (v) => v * (96 / 2.54),
    fromPx: (px) => px * (2.54 / 96),
  },
  {
    id: "mm",
    label: "Millimeters (mm)",
    category: "absolute",
    toPx: (v) => v * (96 / 25.4),
    fromPx: (px) => px * (25.4 / 96),
  },

  // Relative (Typography)
  {
    id: "rem",
    label: "Root EM (rem)",
    category: "relative",
    toPx: (v, ctx) => v * ctx.baseFontSize,
    fromPx: (px, ctx) => px / ctx.baseFontSize,
  },
  {
    id: "em",
    label: "EM (em)",
    category: "relative",
    toPx: (v, ctx) => v * ctx.baseFontSize,
    fromPx: (px, ctx) => px / ctx.baseFontSize,
  },
  {
    id: "%",
    label: "Percentage (%)",
    category: "relative",
    toPx: (v, ctx) => (v / 100) * ctx.baseFontSize,
    fromPx: (px, ctx) => (px / ctx.baseFontSize) * 100,
  },

  // Viewport
  {
    id: "vw",
    label: "Viewport Width (vw)",
    category: "viewport",
    toPx: (v, ctx) => (v / 100) * ctx.viewportWidth,
    fromPx: (px, ctx) => (px / ctx.viewportWidth) * 100,
  },
  {
    id: "vh",
    label: "Viewport Height (vh)",
    category: "viewport",
    toPx: (v, ctx) => (v / 100) * ctx.viewportHeight,
    fromPx: (px, ctx) => (px / ctx.viewportHeight) * 100,
  },
  {
    id: "vmin",
    label: "Viewport Min (vmin)",
    category: "viewport",
    toPx: (v, ctx) =>
      (v / 100) * Math.min(ctx.viewportWidth, ctx.viewportHeight),
    fromPx: (px, ctx) =>
      (px / Math.min(ctx.viewportWidth, ctx.viewportHeight)) * 100,
  },
  {
    id: "vmax",
    label: "Viewport Max (vmax)",
    category: "viewport",
    toPx: (v, ctx) =>
      (v / 100) * Math.max(ctx.viewportWidth, ctx.viewportHeight),
    fromPx: (px, ctx) =>
      (px / Math.max(ctx.viewportWidth, ctx.viewportHeight)) * 100,
  },
];

export const CssUnitConverterTool: React.FC = () => {
  const [inputValue, setInputValue] = useLocalStorage<string>(
    "css-unit-value",
    "16"
  );
  const [sourceUnit, setSourceUnit] = useLocalStorage<string>(
    "css-unit-source",
    "px"
  );

  // Context Config
  const [baseFontSize, setBaseFontSize] = useLocalStorage<number>(
    "css-unit-base",
    16
  );
  const [viewportW, setViewportW] = useLocalStorage<number>(
    "css-unit-vw",
    1920
  );
  const [viewportH, setViewportH] = useLocalStorage<number>(
    "css-unit-vh",
    1080
  );

  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "CSS Unit Converter - DevUtils";
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const results = useMemo(() => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) return [];

    const sourceDef = UNITS.find((u) => u.id === sourceUnit);
    if (!sourceDef) return [];

    const context: Context = {
      baseFontSize,
      viewportWidth: viewportW,
      viewportHeight: viewportH,
    };

    // 1. Normalize to Pixels
    const pixels = sourceDef.toPx(val, context);

    // 2. Convert to all others
    return UNITS.map((unit) => {
      const converted = unit.fromPx(pixels, context);
      // Pretty formatting logic
      let display = converted.toFixed(4);
      // Remove trailing zeros
      display = parseFloat(display).toString();

      return {
        ...unit,
        value: display,
        isSource: unit.id === sourceUnit,
      };
    });
  }, [inputValue, sourceUnit, baseFontSize, viewportW, viewportH]);

  const renderGroup = (
    title: string,
    icon: React.ElementType,
    category: UnitCategory
  ) => {
    const groupItems = results.filter((r) => r.category === category);
    if (groupItems.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground pb-1 border-b border-border/40">
          <div
            className={`p-1 rounded ${category === "absolute" ? "bg-blue-500/10 text-blue-500" : category === "relative" ? "bg-purple-500/10 text-purple-500" : "bg-orange-500/10 text-orange-500"}`}
          >
            {React.createElement(icon, { className: "h-3.5 w-3.5" })}
          </div>
          {title}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {groupItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleCopy(item.value, item.id)}
              className={`
                            relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer group
                            ${
                              item.isSource
                                ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
                            }
                        `}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-xl font-mono font-medium truncate text-foreground group-hover:text-primary transition-colors">
                  {item.value}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.label}
                </span>
              </div>

              <div
                className={`p-1.5 rounded-md transition-colors ${copiedId === item.id ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "text-muted-foreground bg-muted/50 group-hover:bg-background"}`}
              >
                {copiedId === item.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              CSS Unit Converter
            </h1>
            <p className="text-xs text-muted-foreground">
              Convert between px, rem, em, %, vw, and more.
            </p>
          </div>
        </div>
      </div>

      {/* Main Input & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Input */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="p-6 border-border shadow-sm bg-card flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Value to Convert
                </label>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full text-4xl font-bold bg-transparent border-b-2 border-border focus:border-primary outline-none py-2 transition-colors placeholder:text-muted/30"
                  placeholder="0"
                />
              </div>
              <div className="w-full sm:w-48 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  From Unit
                </label>
                <select
                  value={sourceUnit}
                  onChange={(e) => setSourceUnit(e.target.value)}
                  className="w-full h-12 rounded-lg border border-input bg-background px-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Results Area */}
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderGroup("Typography & Absolute", Type, "absolute")}
            {renderGroup("Relative to Font Size", ArrowRightLeft, "relative")}
            {renderGroup("Relative to Viewport", Monitor, "viewport")}
          </div>
        </div>

        {/* Sidebar Configuration */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 border-border/60 bg-muted/10 h-fit sticky top-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border/40">
              <Settings2 className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Conversion Context</span>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Base Font Size
                  </label>
                  <span className="text-xs font-mono">{baseFontSize}px</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={baseFontSize}
                    onChange={(e) => setBaseFontSize(Number(e.target.value))}
                    className="h-9 font-mono"
                  />
                  <div className="flex items-center justify-center px-3 bg-muted rounded border border-input text-xs text-muted-foreground">
                    px
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Used for rem, em, and % calculations.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Viewport Dimensions
                  </label>
                  <span className="text-xs font-mono">
                    {viewportW}x{viewportH}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={viewportW}
                      onChange={(e) => setViewportW(Number(e.target.value))}
                      className="h-9 font-mono"
                      placeholder="W"
                    />
                    <span className="text-[10px] text-muted-foreground pl-1">
                      Width
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      value={viewportH}
                      onChange={(e) => setViewportH(Number(e.target.value))}
                      className="h-9 font-mono"
                      placeholder="H"
                    />
                    <span className="text-[10px] text-muted-foreground pl-1">
                      Height
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Used for vw, vh, vmin, and vmax calculations.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setBaseFontSize(16);
                    setViewportW(1920);
                    setViewportH(1080);
                  }}
                >
                  Reset Defaults
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
