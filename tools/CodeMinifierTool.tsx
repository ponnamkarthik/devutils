"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Code,
  Play,
  Eraser,
  Copy,
  Check,
  ArrowRight,
  Activity,
} from "lucide-react";

type Language = "javascript" | "css" | "html";

export const CodeMinifierTool: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState<Language>("javascript");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState<{
    original: number;
    minified: number;
    savings: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const getPlaceholder = () => {
    switch (language) {
      case "javascript":
        return '// Paste your JS code here\nfunction hello() {\n  console.log("Hello World");\n}';
      case "css":
        return "/* Paste your CSS here */\nbody {\n  background: #fff;\n}";
      case "html":
        return '<!-- Paste your HTML here -->\n<div class="container">\n  <h1>Hello</h1>\n</div>';
    }
  };

  const minifyJs = (code: string): string => {
    // A simple, safe tokenizer to remove comments while preserving strings.
    // This avoids the pitfalls of regex-based comment removal (e.g., http://url.com).
    let result = "";
    let i = 0;
    const len = code.length;
    let state:
      | "normal"
      | "single_quote"
      | "double_quote"
      | "template"
      | "block_comment"
      | "line_comment" = "normal";

    while (i < len) {
      const char = code[i];
      const next = code[i + 1];

      switch (state) {
        case "normal":
          if (char === "/" && next === "/") {
            state = "line_comment";
            i++;
          } else if (char === "/" && next === "*") {
            state = "block_comment";
            i++;
          } else if (char === "'") {
            state = "single_quote";
            result += char;
          } else if (char === '"') {
            state = "double_quote";
            result += char;
          } else if (char === "`") {
            state = "template";
            result += char;
          } else {
            result += char;
          }
          break;

        case "single_quote":
          result += char;
          if (char === "'" && code[i - 1] !== "\\") state = "normal";
          break;

        case "double_quote":
          result += char;
          if (char === '"' && code[i - 1] !== "\\") state = "normal";
          break;

        case "template":
          result += char;
          if (char === "`" && code[i - 1] !== "\\") state = "normal";
          break;

        case "line_comment":
          if (char === "\n") {
            state = "normal";
            result += char;
          }
          break;

        case "block_comment":
          if (char === "*" && next === "/") {
            state = "normal";
            i++;
          }
          break;
      }
      i++;
    }

    // After removing comments, perform safe whitespace collapsing
    return result
      .replace(/^\s+|\s+$/g, "") // Trim
      .replace(/([;{,}\):])\s+/g, "$1") // Remove space after separators
      .replace(/\s+([;{,}\(:])/g, "$1") // Remove space before separators
      .replace(/\s+/g, " "); // Collapse remaining whitespace
  };

  const minifyCss = (code: string): string => {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove comments
      .replace(/\s*([\{\}\:\;\,])\s*/g, "$1") // Remove whitespace around delimiters
      .replace(/[\r\n]+/g, "") // Remove newlines
      .replace(/;}/g, "}") // Remove last semicolon
      .trim();
  };

  const minifyHtml = (code: string): string => {
    return code
      .replace(/<!--[\s\S]*?-->/g, "") // Remove comments
      .replace(/>\s+</g, "><") // Remove whitespace between tags
      .replace(/\s{2,}/g, " ") // Collapse multiple spaces
      .trim();
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setIsProcessing(true);

    // Use setTimeout to allow UI to render "Processing" state for large inputs
    setTimeout(() => {
      let minified = "";
      try {
        switch (language) {
          case "javascript":
            minified = minifyJs(input);
            break;
          case "css":
            minified = minifyCss(input);
            break;
          case "html":
            minified = minifyHtml(input);
            break;
        }

        setOutput(minified);

        // Calculate stats
        const originalBytes = new Blob([input]).size;
        const minifiedBytes = new Blob([minified]).size;
        const savings =
          originalBytes > 0
            ? ((originalBytes - minifiedBytes) / originalBytes) * 100
            : 0;

        setStats({
          original: originalBytes,
          minified: minifiedBytes,
          savings: Math.max(0, savings),
        });
      } catch (e) {
        setOutput("Error during minification.");
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Code Minifier
            </h1>
            <p className="text-xs text-muted-foreground">
              Reduce file size by removing comments and unnecessary whitespace.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus:ring-ring font-medium"
          >
            <option value="javascript">JavaScript (JS)</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
          </select>

          <div className="w-px h-6 bg-border mx-1" />

          <Button
            onClick={handleMinify}
            size="sm"
            className="min-w-[100px]"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Activity className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Minify
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setInput("");
              setOutput("");
              setStats(null);
            }}
            variant="destructive"
            size="sm"
            title="Clear All"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card">
          <MonacoEditor
            label={`${language.toUpperCase()} Input`}
            value={input}
            onChange={setInput}
            language={language}
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card relative overflow-hidden">
          <MonacoEditor
            label="Minified Output"
            value={output}
            readOnly
            lineHighlight="none"
            lineNumbers="off"
            language={language}
            className="border-none"
            actions={
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                disabled={!output}
                className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
              >
                {copied ? (
                  <Check className="h-3 w-3 mr-1 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3 mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            }
          />

          {stats && (
            <div className="absolute bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-2 px-4 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 z-10">
              <div className="flex gap-4">
                <span className="text-muted-foreground">
                  Original:{" "}
                  <strong className="text-foreground">
                    {formatBytes(stats.original)}
                  </strong>
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Minified:{" "}
                  <strong className="text-foreground">
                    {formatBytes(stats.minified)}
                  </strong>
                </span>
              </div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                Saved {stats.savings.toFixed(1)}%
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
