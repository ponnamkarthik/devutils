"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Image,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileCode,
  Download,
  Check,
  Copy,
  Eraser,
  Grid,
  Sun,
  Moon,
  MoveHorizontal,
  MoveVertical,
  Scaling,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
// @ts-ignore
import prettier from "prettier";
// @ts-ignore
import parserHtml from "prettier/plugins/html";

export const SvgTool: React.FC = () => {
  const [input, setInput] = useLocalStorage<string>(
    "devutils-svg-input",
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none"><rect width="512" height="512" rx="140" fill="#061B22"/><path d="M316 256L148.54 423.46C140.584 431.416 129.792 435.886 118.54 435.886C107.288 435.886 96.4966 431.416 88.5401 423.46C80.5836 415.503 76.1136 404.712 76.1136 393.46C76.1136 382.208 80.5836 371.416 88.5401 363.46L256 196" stroke="#10B77F" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><path d="M376 316L456 236" stroke="#10B77F" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/><path d="M446 246L407.72 207.72C400.218 200.22 396.002 190.048 396 179.44V156L350.8 110.8C328.491 88.5037 298.3 75.8871 266.76 75.6798L196 75.1998L214.4 91.6C227.469 103.188 237.934 117.414 245.104 133.341C252.275 149.268 255.988 166.533 256 184V216L296 256H319.44C330.048 256.002 340.22 260.218 347.72 267.72L386 306" stroke="#10B77F" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  );
  const [zoom, setZoom] = useState(1);
  const [bgMode, setBgMode] = useState<"transparent" | "white" | "black">(
    "transparent"
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform State
  const [resizeW, setResizeW] = useState("");
  const [resizeH, setResizeH] = useState("");

  useEffect(() => {
    document.title = "SVG Viewer & Editor - DevUtils";
  }, []);

  // Update resize inputs when input changes (parse current dimensions)
  useEffect(() => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (svg) {
        setResizeW(svg.getAttribute("width") || "");
        setResizeH(svg.getAttribute("height") || "");
      }
    } catch (e) {}
  }, [input]);

  const handleFormat = async () => {
    try {
      const formatted = await prettier.format(input, {
        parser: "html",
        plugins: [parserHtml],
        printWidth: 80,
        tabWidth: 2,
      });
      setInput(formatted);
      setError(null);
    } catch (e: any) {
      // Prettier might fail on invalid XML
      setError("Invalid SVG: " + e.message);
    }
  };

  const handleMinify = () => {
    // Simple regex-based minification for offline usage
    const minified = input
      .replace(/>\s+</g, "><") // Remove spaces between tags
      .replace(/\s{2,}/g, " ") // Collapse spaces
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/\n/g, "");
    setInput(minified);
  };

  const handleResize = () => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) throw new Error("No SVG root found");

      // Ensure viewBox exists before resizing to maintain aspect ratio logic if needed by renderer
      // If no viewBox, creating one from current width/height is good practice before resizing
      if (!svg.getAttribute("viewBox")) {
        const currW = svg.getAttribute("width") || "300"; // defaults
        const currH = svg.getAttribute("height") || "150";
        svg.setAttribute(
          "viewBox",
          `0 0 ${parseFloat(currW)} ${parseFloat(currH)}`
        );
      }

      if (resizeW) svg.setAttribute("width", resizeW);
      else svg.removeAttribute("width");

      if (resizeH) svg.setAttribute("height", resizeH);
      else svg.removeAttribute("height");

      setInput(new XMLSerializer().serializeToString(doc));
      setError(null);
    } catch (e: any) {
      setError("Resize failed: " + e.message);
    }
  };

  const handleFlip = (direction: "H" | "V") => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "image/svg+xml");
      const svg = doc.querySelector("svg");
      if (!svg) throw new Error("No SVG root found");

      // Determine dimensions for the transform origin/translation
      let w = 0,
        h = 0;
      const viewBox = svg.getAttribute("viewBox");
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(parseFloat);
        if (parts.length === 4) {
          w = parts[2];
          h = parts[3];
        }
      } else {
        w = parseFloat(svg.getAttribute("width") || "300");
        h = parseFloat(svg.getAttribute("height") || "150");
      }

      // Create a group to wrap content
      const g = doc.createElementNS("http://www.w3.org/2000/svg", "g");

      // Move all children of SVG into the group
      // Note: iterating backwards or while(firstChild) is safe
      while (svg.firstChild) {
        g.appendChild(svg.firstChild);
      }

      // Apply Transform
      // Horizontal: Mirror X. Translate back by Width.
      // Vertical: Mirror Y. Translate back by Height.
      if (direction === "H") {
        g.setAttribute("transform", `translate(${w}, 0) scale(-1, 1)`);
      } else {
        g.setAttribute("transform", `translate(0, ${h}) scale(1, -1)`);
      }

      svg.appendChild(g);
      setInput(new XMLSerializer().serializeToString(doc));
      setError(null);
    } catch (e: any) {
      setError("Flip failed: " + e.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSvg = () => {
    const blob = new Blob([input], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "image.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safe render check
  const renderPreview = () => {
    if (!input.trim().startsWith("<")) return null;
    return { __html: input };
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
            <Image className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SVG Editor
            </h1>
            <p className="text-xs text-muted-foreground">
              View, optimize, edit, and transform SVG code.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 bg-card p-2 rounded-lg border border-border shadow-sm flex-none">
        {/* Row 1: Main Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleFormat}
              variant="ghost"
              size="sm"
              title="Format Code"
            >
              <FileCode className="mr-2 h-4 w-4" /> Format
            </Button>
            <Button
              onClick={handleMinify}
              variant="ghost"
              size="sm"
              title="Minify Code"
            >
              <Eraser className="mr-2 h-4 w-4" /> Minify
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
            <div className="w-px h-6 bg-border mx-1" />
            <Button onClick={downloadSvg} variant="secondary" size="sm">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        {/* Row 2: Transform Tools */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border/40 pt-2">
          {/* Dimensions */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                W
              </span>
              <input
                type="text"
                value={resizeW}
                onChange={(e) => setResizeW(e.target.value)}
                className="w-14 h-7 text-xs px-2 border border-input rounded bg-background focus:outline-none focus:border-primary"
                placeholder="auto"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                H
              </span>
              <input
                type="text"
                value={resizeH}
                onChange={(e) => setResizeH(e.target.value)}
                className="w-14 h-7 text-xs px-2 border border-input rounded bg-background focus:outline-none focus:border-primary"
                placeholder="auto"
              />
            </div>
            <Button
              onClick={handleResize}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
            >
              <Scaling className="h-3.5 w-3.5 mr-1.5" /> Resize
            </Button>
          </div>

          <div className="w-px h-4 bg-border" />

          {/* Flip */}
          <div className="flex items-center gap-1">
            <Button
              onClick={() => handleFlip("H")}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              title="Flip Horizontal"
            >
              <MoveHorizontal className="h-3.5 w-3.5 mr-1.5" /> Flip H
            </Button>
            <Button
              onClick={() => handleFlip("V")}
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              title="Flip Vertical"
            >
              <MoveVertical className="h-3.5 w-3.5 mr-1.5" /> Flip V
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Editor */}
        <Card className="flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
          <MonacoEditor
            value={input}
            onChange={setInput}
            language="html"
            label="SVG Code"
            className="border-none"
          />
        </Card>

        {/* Preview */}
        <Card className="flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden relative">
          {/* Preview Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20 z-10">
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-2">
                Preview
              </span>

              <div className="flex bg-background border border-border rounded-md p-0.5">
                <button
                  onClick={() => setBgMode("transparent")}
                  className={`p-1.5 rounded transition-colors ${bgMode === "transparent" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Transparent Grid"
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setBgMode("white")}
                  className={`p-1.5 rounded transition-colors ${bgMode === "white" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="White Background"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setBgMode("black")}
                  className={`p-1.5 rounded transition-colors ${bgMode === "black" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  title="Black Background"
                >
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
                className="p-1 hover:bg-muted rounded"
              >
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
              </button>
              <span className="text-xs font-mono w-10 text-center text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(5, z + 0.1))}
                className="p-1 hover:bg-muted rounded"
              >
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="p-1 hover:bg-muted rounded ml-1"
                title="Reset Zoom"
              >
                <Maximize className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Rendering Area */}
          <div
            className={`flex-1 overflow-hidden relative flex items-center justify-center
                  ${bgMode === "transparent" ? "bg-transparent" : bgMode === "white" ? "bg-white" : "bg-black"}
              `}
          >
            {/* Checkerboard Pattern for transparent mode */}
            {bgMode === "transparent" && (
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              />
            )}

            <div
              className="transition-transform duration-200 ease-out origin-center"
              style={{
                transform: `scale(${zoom})`,
                maxWidth: "100%",
                maxHeight: "100%",
                padding: "2rem",
              }}
              dangerouslySetInnerHTML={renderPreview() || { __html: "" }}
            />

            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
