"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  LayoutGrid,
  Layers,
  MousePointer2,
  Code,
  RefreshCw,
  X,
  Plus,
  AlertCircle,
  Monitor,
  Copy,
  Check,
  Wind,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// --- Types ---

interface GridItem {
  id: string;
  name: string;
  color: string;
  // Grid coordinates are 1-based
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
}

interface Coordinate {
  row: number;
  col: number;
}

// --- Constants ---

const COLORS = [
  "bg-rose-200 border-rose-300 text-rose-900",
  "bg-orange-200 border-orange-300 text-orange-900",
  "bg-amber-200 border-amber-300 text-amber-900",
  "bg-emerald-200 border-emerald-300 text-emerald-900",
  "bg-cyan-200 border-cyan-300 text-cyan-900",
  "bg-indigo-200 border-indigo-300 text-indigo-900",
  "bg-violet-200 border-violet-300 text-violet-900",
  "bg-fuchsia-200 border-fuchsia-300 text-fuchsia-900",
];

const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export const CssGridTool: React.FC = () => {
  // --- State ---

  // Config - Allow string to handle empty input state gracefully
  const [rows, setRows] = useLocalStorage<number | string>("css-grid-rows", 5);
  const [cols, setCols] = useLocalStorage<number | string>("css-grid-cols", 5);
  const [gap, setGap] = useLocalStorage<number | string>("css-grid-gap", 8);

  // Data
  const [items, setItems] = useLocalStorage<GridItem[]>("css-grid-items", []);

  // Interaction
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Coordinate | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Coordinate | null>(null);

  // Copy State
  const [copiedCss, setCopiedCss] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedTailwind, setCopiedTailwind] = useState(false);

  // UI State
  const [outputMode, setOutputMode] = useState<"standard" | "tailwind">(
    "standard"
  );

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "CSS Grid Generator - DevUtils";
  }, []);

  // --- Logic ---

  // Derived safe values for rendering
  const safeRows = useMemo(() => {
    const r = typeof rows === "string" ? parseInt(rows) : rows;
    return isNaN(r) || r < 1 ? 1 : Math.min(24, r);
  }, [rows]);

  const safeCols = useMemo(() => {
    const c = typeof cols === "string" ? parseInt(cols) : cols;
    return isNaN(c) || c < 1 ? 1 : Math.min(24, c);
  }, [cols]);

  const safeGap = useMemo(() => {
    const g = typeof gap === "string" ? parseInt(gap) : gap;
    return isNaN(g) || g < 0 ? 0 : Math.min(100, g);
  }, [gap]);

  const clearGrid = () => setItems([]);

  const normalizeSelection = (start: Coordinate, end: Coordinate) => {
    const rowStart = Math.min(start.row, end.row);
    const rowEnd = Math.max(start.row, end.row) + 1; // +1 because CSS grid lines end after the cell
    const colStart = Math.min(start.col, end.col);
    const colEnd = Math.max(start.col, end.col) + 1;
    return { rowStart, rowEnd, colStart, colEnd };
  };

  const isOverlapping = (item1: Partial<GridItem>, item2: GridItem) => {
    const noOverlap =
      item1.colEnd! <= item2.colStart ||
      item1.colStart! >= item2.colEnd ||
      item1.rowEnd! <= item2.rowStart ||
      item1.rowStart! >= item2.rowEnd;

    return !noOverlap;
  };

  const hasCollision = useMemo(() => {
    if (!isDragging || !dragStart || !dragCurrent) return false;
    const selection = normalizeSelection(dragStart, dragCurrent);
    return items.some((item) => isOverlapping(selection, item));
  }, [isDragging, dragStart, dragCurrent, items]);

  const copyToClipboard = (text: string, type: "css" | "html" | "tailwind") => {
    navigator.clipboard.writeText(text);
    if (type === "css") {
      setCopiedCss(true);
      setTimeout(() => setCopiedCss(false), 2000);
    } else if (type === "html") {
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 2000);
    } else {
      setCopiedTailwind(true);
      setTimeout(() => setCopiedTailwind(false), 2000);
    }
  };

  // Helper for safe input updates
  const handleConfigChange = (
    val: string,
    setter: (v: number | string) => void,
    min: number,
    max: number
  ) => {
    if (val === "") {
      setter("");
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num)) {
      setter(Math.min(max, Math.max(min, num)));
    }
  };

  // --- Handlers ---

  const handleMouseDown = (row: number, col: number) => {
    const cellSelection = {
      rowStart: row,
      rowEnd: row + 1,
      colStart: col,
      colEnd: col + 1,
    };
    const occupied = items.some((item) => isOverlapping(cellSelection, item));
    if (occupied) return;

    setIsDragging(true);
    setDragStart({ row, col });
    setDragCurrent({ row, col });
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      setDragCurrent({ row, col });
    }
  };

  const handleMouseUp = () => {
    if (isDragging && dragStart && dragCurrent && !hasCollision) {
      const { rowStart, rowEnd, colStart, colEnd } = normalizeSelection(
        dragStart,
        dragCurrent
      );

      const newItem: GridItem = {
        id: `item-${Date.now()}`,
        name: `div${items.length + 1}`,
        color: getRandomColor(),
        rowStart,
        rowEnd,
        colStart,
        colEnd,
      };

      setItems([...items, newItem]);
    }
    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  // --- Code Generation ---

  const generatedCode = useMemo(() => {
    // 1. Standard CSS/HTML
    let css = `.parent {
    display: grid;
    grid-template-columns: repeat(${safeCols}, 1fr);
    grid-template-rows: repeat(${safeRows}, 1fr);
    gap: ${safeGap}px;
}
`;
    let html = `<div class="parent">\n`;

    items.forEach((item, idx) => {
      const rowSpan = item.rowEnd - item.rowStart;
      const colSpan = item.colEnd - item.colStart;

      let props: string[] = [];

      // Cleaner CSS: Only use span syntax if spanning more than 1 cell
      if (colSpan > 1) {
        props.push(`grid-column: ${item.colStart} / span ${colSpan};`);
      } else {
        props.push(`grid-column: ${item.colStart};`);
      }

      if (rowSpan > 1) {
        props.push(`grid-row: ${item.rowStart} / span ${rowSpan};`);
      } else {
        props.push(`grid-row: ${item.rowStart};`);
      }

      css += `
.div${idx + 1} {
    ${props.join("\n    ")}
}
`;
      // Output HTML with number inside
      html += `    <div class="div${idx + 1}">${idx + 1}</div>\n`;
    });

    html += `</div>`;

    // 2. Tailwind CSS
    // Helper to determine if we can use standard classes or need arbitrary values
    const getTw = (prefix: string, val: number, maxStandard: number) => {
      if (val <= maxStandard) return `${prefix}-${val}`;
      return `${prefix}-[${val}]`;
    };

    const parentClasses = [
      "grid",
      safeCols > 12
        ? `grid-cols-[repeat(${safeCols},1fr)]`
        : `grid-cols-${safeCols}`,
      safeRows > 6
        ? `grid-rows-[repeat(${safeRows},1fr)]`
        : `grid-rows-${safeRows}`,
      `gap-[${safeGap}px]`,
    ].join(" ");

    let tailwind = `<div class="${parentClasses} w-full min-h-screen bg-gray-50 p-4">\n`;

    items.forEach((item, idx) => {
      const rowSpan = item.rowEnd - item.rowStart;
      const colSpan = item.colEnd - item.colStart;

      const cls = [
        // Start/Span
        getTw("col-start", item.colStart, 13),
        colSpan > 1 ? getTw("col-span", colSpan, 12) : "",
        getTw("row-start", item.rowStart, 7),
        rowSpan > 1 ? getTw("row-span", rowSpan, 6) : "",

        // Visuals (to make the snippet usable immediately)
        "bg-indigo-500",
        "rounded-lg",
        "text-white",
        "flex",
        "items-center",
        "justify-center",
        "font-bold",
        "text-lg",
        "shadow-sm",
      ]
        .filter(Boolean)
        .join(" ");

      tailwind += `    <div class="${cls}">${idx + 1}</div>\n`;
    });
    tailwind += `</div>`;

    return { css, html, tailwind };
  }, [safeRows, safeCols, safeGap, items]);

  // --- Styling Constants ---
  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${safeCols}, 1fr)`,
    gridTemplateRows: `repeat(${safeRows}, 1fr)`,
    gap: `${safeGap}px`,
  };

  return (
    <div
      className="flex flex-col gap-6 w-full h-full min-h-[600px]"
      onMouseUp={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              CSS Grid Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Visually build CSS grid layouts and export code.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Controls Sidebar */}
        <div className="lg:col-span-3 flex flex-col gap-4 lg:overflow-y-auto h-fit lg:h-full pr-1">
          <Card className="p-4 space-y-5 border-border/60 shadow-sm bg-card h-fit">
            <div className="flex items-center gap-2 pb-2 border-b border-border/40">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Grid Settings</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Columns
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={cols}
                    onChange={(e) =>
                      handleConfigChange(e.target.value, setCols, 1, 24)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Rows
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={24}
                    value={rows}
                    onChange={(e) =>
                      handleConfigChange(e.target.value, setRows, 1, 24)
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Gap (px)
                </label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={gap}
                  onChange={(e) =>
                    handleConfigChange(e.target.value, setGap, 0, 100)
                  }
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={clearGrid}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Reset Grid
              </Button>
            </div>
          </Card>

          <Card className="p-4 border-border/60 shadow-sm bg-muted/10">
            <div className="text-xs text-muted-foreground space-y-2">
              <p className="flex items-start gap-2">
                <MousePointer2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Click & Drag</strong> across grey cells to create a
                  new area.
                </span>
              </p>
              <p className="flex items-start gap-2 text-amber-600 dark:text-amber-500">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Items cannot overlap.</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Visual Editor */}
        <div className="lg:col-span-9 flex flex-col gap-4 lg:h-full">
          {/* Canvas Area */}
          <div
            className="flex-none bg-[#fbf7f0] dark:bg-[#1a1b1e] border border-border rounded-xl shadow-inner relative flex items-center justify-center p-4 sm:p-8 overflow-auto"
            style={{ minHeight: "400px" }}
          >
            {/* The Grid Container - Fixed Aspect Ratio */}
            <div
              ref={containerRef}
              className="relative bg-white dark:bg-black shadow-2xl rounded-lg transition-all duration-300"
              style={{
                width: "100%",
                maxWidth: "800px",
                aspectRatio: "5 / 2", // Fixed aspect ratio
                minHeight: "300px",
              }}
            >
              {/* LAYER 1: Background Cells (The Interaction Layer) */}
              {/* Reduced Z-index to 1 to stay below overlays/footer if scrolling occurs */}
              <div className="absolute inset-0 p-4 z-[1]" style={gridStyle}>
                {Array.from({ length: safeRows * safeCols }).map((_, i) => {
                  const r = Math.floor(i / safeCols) + 1;
                  const c = (i % safeCols) + 1;
                  return (
                    <div
                      key={i}
                      className="bg-[#e5e5e5] dark:bg-[#2c2e33] rounded-[4px] cursor-crosshair flex items-center justify-center group hover:bg-[#d4d4d4] dark:hover:bg-[#3b3d42] transition-colors"
                      onMouseDown={() => handleMouseDown(r, c)}
                      onMouseEnter={() => handleMouseEnter(r, c)}
                    >
                      <Plus className="text-black/5 dark:text-white/5 w-4 h-4 group-hover:scale-110 transition-transform" />
                    </div>
                  );
                })}
              </div>

              {/* LAYER 2: Placed Items (The Display Layer) */}
              {/* Z-index 5 */}
              <div
                className="absolute inset-0 p-4 z-[5] pointer-events-none"
                style={gridStyle}
              >
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`
                                      ${item.color} rounded-[4px] shadow-sm flex items-center justify-center relative group pointer-events-auto border-2
                                      font-mono font-bold text-sm select-none animate-in zoom-in-95 duration-200
                                  `}
                    style={{
                      gridArea: `${item.rowStart} / ${item.colStart} / ${item.rowEnd} / ${item.colEnd}`,
                    }}
                  >
                    <span className="drop-shadow-sm opacity-90">
                      .div{idx + 1}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-white dark:bg-zinc-800 text-destructive border border-border shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50 cursor-pointer"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* LAYER 3: Drag Selection Overlay */}
              {/* Z-index 6 */}
              {isDragging && dragStart && dragCurrent && (
                <div
                  className="absolute inset-0 p-4 z-[6] pointer-events-none"
                  style={gridStyle}
                >
                  <div
                    className={`
                                      border-2 rounded-[4px] flex items-center justify-center transition-all duration-75
                                      ${
                                        hasCollision
                                          ? "bg-red-500/40 border-red-600 text-white"
                                          : "bg-indigo-500/40 border-indigo-600 text-white"
                                      }
                                  `}
                    style={{
                      gridArea: `${Math.min(dragStart.row, dragCurrent.row)} / ${Math.min(dragStart.col, dragCurrent.col)} / ${Math.max(dragStart.row, dragCurrent.row) + 1} / ${Math.max(dragStart.col, dragCurrent.col) + 1}`,
                    }}
                  >
                    {hasCollision ? (
                      <X className="h-8 w-8" />
                    ) : (
                      <Plus className="h-8 w-8" />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Code Output */}
          <div className="flex flex-col gap-3 flex-none">
            {/* Mode Switcher */}
            <div className="flex justify-center">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setOutputMode("standard")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${outputMode === "standard" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Code className="h-3.5 w-3.5" /> CSS / HTML
                </button>
                <button
                  onClick={() => setOutputMode("tailwind")}
                  className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${outputMode === "tailwind" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Wind className="h-3.5 w-3.5" /> Tailwind
                </button>
              </div>
            </div>

            {outputMode === "standard" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="h-80 md:h-96 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/20">
                    <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                      <Code className="h-3.5 w-3.5" /> CSS
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedCode.css, "css")}
                      className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
                    >
                      {copiedCss ? (
                        <Check className="h-3 w-3 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedCss ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <MonacoEditor
                    value={generatedCode.css}
                    language="css"
                    readOnly
                    className="border-none"
                    lineNumbers="off"
                  />
                </Card>
                <Card className="h-80 md:h-96 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/20">
                    <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                      <Code className="h-3.5 w-3.5" /> HTML
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(generatedCode.html, "html")
                      }
                      className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
                    >
                      {copiedHtml ? (
                        <Check className="h-3 w-3 mr-1 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedHtml ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <MonacoEditor
                    value={generatedCode.html}
                    language="html"
                    readOnly
                    className="border-none"
                    lineNumbers="off"
                  />
                </Card>
              </div>
            ) : (
              <Card className="h-80 md:h-96 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 bg-muted/20">
                  <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Wind className="h-3.5 w-3.5" /> Tailwind CSS HTML
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(generatedCode.tailwind, "tailwind")
                    }
                    className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
                  >
                    {copiedTailwind ? (
                      <Check className="h-3 w-3 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copiedTailwind ? "Copied" : "Copy"}
                  </Button>
                </div>
                <MonacoEditor
                  value={generatedCode.tailwind}
                  language="html"
                  readOnly
                  className="border-none"
                  lineNumbers="off"
                />
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
