"use client";

import React, { useState, useMemo, useRef } from "react";
import { Card, Button } from "../components/UI";
import {
  Type,
  Hash,
  AlignLeft,
  Search,
  Eraser,
  Clipboard,
  Sparkles,
  Info,
  Copy,
  Check,
  Binary,
  Code2,
  MousePointer2,
  Maximize2,
  Minimize2,
} from "lucide-react";

export const StringInspectorTool: React.FC = () => {
  const [text, setText] = useState("");
  const [wordFilter, setWordFilter] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [selection, setSelection] = useState({
    start: 0,
    end: 0,
    line: 1,
    column: 1,
  });
  const [copied, setCopied] = useState(false);
  const [isFullHeight, setIsFullHeight] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const graphemeSegmenter = useMemo(() => {
    if (typeof Intl === "undefined") return null;
    const Segmenter = (Intl as unknown as { Segmenter?: typeof Intl.Segmenter })
      .Segmenter;
    if (!Segmenter) return null;
    return new Segmenter(undefined, { granularity: "grapheme" });
  }, []);

  const stats = useMemo(() => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text).length;
    const codeUnits = text.length;
    const codePoints = Array.from(text).length;

    const graphemes = (() => {
      if (!text) return 0;
      if (graphemeSegmenter) {
        let count = 0;
        for (const _ of graphemeSegmenter.segment(text)) count++;
        return count;
      }
      return codePoints;
    })();

    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r\n|\r|\n/).length : 0;
    const nonEmptyLines = text
      ? text.split(/\r\n|\r|\n/).filter((line) => line.trim().length > 0).length
      : 0;

    return {
      bytes,
      graphemes,
      codePoints,
      codeUnits,
      words,
      lines,
      nonEmptyLines,
    };
  }, [text, graphemeSegmenter]);

  const wordDistribution = useMemo(() => {
    if (!text.trim()) return [];
    const counts: Record<string, number> = {};
    // Split by common delimiters but keep alphanumeric structure
    const words = text
      .split(/[\s,.;:!?()\[\]{}"'\\/]+/)
      .filter((w) => w.length > 0);

    words.forEach((w) => {
      const key = caseSensitive ? w : w.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency desc
      .filter(([word]) =>
        word.toLowerCase().includes(wordFilter.toLowerCase())
      );
  }, [text, wordFilter, caseSensitive]);

  const currentCharInfo = useMemo(() => {
    if (!text) return null;

    let cursorIndex = selection.start;
    if (cursorIndex >= text.length && cursorIndex > 0) cursorIndex--;
    if (cursorIndex < 0 || cursorIndex >= text.length) return null;

    const segment = (() => {
      if (graphemeSegmenter) {
        for (const seg of graphemeSegmenter.segment(text)) {
          const start = seg.index;
          const end = seg.index + seg.segment.length;
          if (cursorIndex >= start && cursorIndex < end) return seg.segment;
        }
      }

      // Fallback: ensure we don't land on the low surrogate.
      const cu = text.charCodeAt(cursorIndex);
      if (cu >= 0xdc00 && cu <= 0xdfff && cursorIndex > 0) {
        const prev = text.charCodeAt(cursorIndex - 1);
        if (prev >= 0xd800 && prev <= 0xdbff) cursorIndex--;
      }
      const cp = text.codePointAt(cursorIndex);
      if (cp == null) return null;
      return String.fromCodePoint(cp);
    })();

    if (!segment) return null;

    const codePoints = Array.from(segment)
      .map((ch) => ch.codePointAt(0))
      .filter((cp): cp is number => typeof cp === "number");

    const hexList = codePoints.map((cp) =>
      cp.toString(16).toUpperCase().padStart(4, "0")
    );
    const unicode = hexList.map((h) => `U+${h}`).join(" ");
    const dec = codePoints.join(", ");
    const htmlEntity = codePoints.map((cp) => `&#${cp};`).join("");

    return {
      segment,
      unicode,
      dec,
      htmlEntity,
      isAscii: codePoints.length > 0 && codePoints.every((cp) => cp < 128),
    };
  }, [text, selection.start, graphemeSegmenter]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    updateSelection();
  };

  const updateSelection = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd, value } = textareaRef.current;

      // Calculate Line and Column
      const textUpToCursor = value.substring(0, selectionStart);
      const lines = textUpToCursor.split(/\r\n|\r|\n/);
      const currentLine = lines.length;
      const currentColumn = lines[lines.length - 1].length + 1;

      setSelection({
        start: selectionStart,
        end: selectionEnd,
        line: currentLine,
        column: currentColumn,
      });
    }
  };

  const loadSample = () => {
    const sample = `This is a special emoji 🧑‍👩‍👧‍👦.
It is actually made of four different emojis: 👨👩👧👦 and Zero Width Joiners.

If you split the "abc🧑‍👩‍👧‍👦" string on 👩 in most languages, you get two parts.

Programming is fun! 🚀`;
    setText(sample);
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      updateSelection();
    });
  };

  const pasteFromClipboard = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      setText(clip);
      requestAnimationFrame(() => {
        updateSelection();
      });
    } catch (e) {
      // Fallback
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex flex-col gap-4 ${isFullHeight ? "fixed inset-4 z-50 bg-background shadow-2xl rounded-xl border border-border p-4" : "h-[calc(100vh-12rem)] min-h-[500px]"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <Type className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              String Inspector
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Analyze character counts, bytes, and Unicode details.
            </p>
          </div>
        </div>

        {/* Toggle Full Height Mode Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullHeight(!isFullHeight)}
          className="text-muted-foreground"
          title={isFullHeight ? "Exit Fullscreen" : "Maximize Editor"}
        >
          {isFullHeight ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 flex-1 min-h-0">
        {/* --- LEFT COLUMN: Editor --- */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
          <Card className="flex-1 p-0 border-border/60 shadow-sm bg-card overflow-hidden flex flex-col">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between p-2 px-3 border-b border-border/40 bg-muted/20 flex-none">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={pasteFromClipboard}
                  className="h-7 text-xs gap-1.5 px-2.5"
                >
                  <Clipboard className="h-3.5 w-3.5" /> Paste
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyText}
                  className="h-7 text-xs gap-1.5 px-2.5"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setText("")}
                  className="h-7 text-xs gap-1.5 px-2.5 hover:text-destructive"
                >
                  <Eraser className="h-3.5 w-3.5" /> Clear
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadSample}
                  className="h-7 text-xs gap-1.5 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Sample
                </Button>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground hidden sm:block whitespace-nowrap pl-2">
                Ln {selection.line}, Col {selection.column}
              </div>
            </div>

            {/* Text Area */}
            <div className="flex-1 relative bg-card">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleTextChange}
                onKeyUp={updateSelection}
                onMouseUp={updateSelection}
                onSelect={updateSelection}
                onClick={updateSelection}
                spellCheck={false}
                className="absolute inset-0 w-full h-full bg-transparent p-4 sm:p-6 font-mono text-sm sm:text-base resize-none focus:outline-none leading-relaxed custom-scrollbar text-foreground placeholder:text-muted-foreground/40"
                placeholder="Type or paste text here to analyze..."
              />
            </div>

            {/* Selection Footer (Mobile) */}
            <div className="sm:hidden border-t border-border/40 bg-muted/10 p-1 px-3 flex justify-end">
              <span className="text-[10px] font-mono text-muted-foreground">
                Ln {selection.line}, Col {selection.column}
              </span>
            </div>
          </Card>
        </div>

        {/* --- RIGHT COLUMN: Analysis --- */}
        <div className="w-full md:w-72 lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1 flex-none h-full">
          {/* 1. Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <Card className="p-3 bg-card border-border/60 shadow-sm flex flex-col justify-center items-center gap-1 hover:border-primary/30 transition-colors">
              <span className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                {stats.graphemes.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Type className="h-3 w-3" /> Chars
              </span>
            </Card>
            <Card className="p-3 bg-card border-border/60 shadow-sm flex flex-col justify-center items-center gap-1 hover:border-primary/30 transition-colors">
              <span className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                {stats.codePoints.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Code2 className="h-3 w-3" /> Code Pts
              </span>
            </Card>
            <Card className="p-3 bg-card border-border/60 shadow-sm flex flex-col justify-center items-center gap-1 hover:border-primary/30 transition-colors">
              <span className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                {stats.words.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <AlignLeft className="h-3 w-3" /> Words
              </span>
            </Card>
            <Card className="p-3 bg-card border-border/60 shadow-sm flex flex-col justify-center items-center gap-1 hover:border-primary/30 transition-colors">
              <span className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                {stats.lines.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Hash className="h-3 w-3" /> Lines
              </span>
            </Card>
            <Card className="p-3 bg-card border-border/60 shadow-sm flex flex-col justify-center items-center gap-1 hover:border-primary/30 transition-colors">
              <span className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                {stats.nonEmptyLines.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <AlignLeft className="h-3 w-3" /> Non-empty
              </span>
            </Card>
            <Card className="p-3 bg-card border-border/60 shadow-sm flex flex-col justify-center items-center gap-1 hover:border-primary/30 transition-colors">
              <span className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">
                {stats.bytes.toLocaleString()}
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Binary className="h-3 w-3" /> Bytes
              </span>
            </Card>
          </div>

          {/* 2. Character Inspector */}
          <Card
            className={`p-4 space-y-3 transition-all duration-300 shrink-0 ${currentCharInfo ? "opacity-100 border-primary/40" : "opacity-80"}`}
          >
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Info className="h-3.5 w-3.5" /> Character Info
            </h3>
            {currentCharInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 flex items-center justify-center bg-muted/50 rounded-lg text-4xl border border-border shadow-inner">
                    {currentCharInfo.segment}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Unicode
                    </div>
                    <div className="font-mono text-sm font-bold text-primary break-all">
                      {currentCharInfo.unicode}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40">
                  <div className="bg-muted/20 p-2 rounded flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      Decimal
                    </span>
                    <span className="font-mono text-sm font-semibold break-all">
                      {currentCharInfo.dec}
                    </span>
                  </div>
                  <div className="bg-muted/20 p-2 rounded flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      HTML
                    </span>
                    <span className="font-mono text-sm font-semibold break-all">
                      {currentCharInfo.htmlEntity}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground italic flex flex-col items-center gap-2">
                <MousePointer2 className="h-8 w-8 opacity-20" />
                <span>Click cursor to inspect</span>
              </div>
            )}
          </Card>

          {/* 3. Word Frequency */}
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm overflow-hidden min-h-[250px]">
            <div className="p-3 border-b border-border/40 bg-muted/20 space-y-3 flex-none">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Distribution
                </h3>
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={(e) => setCaseSensitive(e.target.checked)}
                    className="rounded border-input text-primary focus:ring-primary w-3 h-3"
                  />
                  Match Case
                </label>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter words..."
                  value={wordFilter}
                  onChange={(e) => setWordFilter(e.target.value)}
                  className="w-full h-8 pl-8 pr-2 rounded-md bg-background border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-card">
              {wordDistribution.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2 p-4">
                  <AlignLeft className="h-8 w-8 opacity-20" />
                  <span className="text-xs">No words found</span>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {wordDistribution.map(([word, count], i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center px-4 py-2 hover:bg-muted/40 transition-colors text-sm group"
                    >
                      <span
                        className="font-mono text-foreground truncate mr-2 select-all"
                        title={word}
                      >
                        {word}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-1 bg-muted rounded-full overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-primary/60"
                            style={{
                              width: `${Math.min(100, (count / wordDistribution[0][1]) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-semibold text-xs text-muted-foreground w-6 text-right tabular-nums">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
