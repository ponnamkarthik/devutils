"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  Minimize2,
  Maximize2,
  Wrench,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface JsonToolProps {
  mode?: "format" | "minify" | "fix";
}

export const JsonTool: React.FC<JsonToolProps> = ({ mode = "format" }) => {
  const [input, setInput] = useLocalStorage<string>("devutils-json-input", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
      setOutput("");
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Invalid JSON");
    }
  }, [input]);

  const fixJson = useCallback(() => {
    if (!input.trim()) return;

    let fixed = input;

    try {
      // 1. Remove trailing commas
      fixed = fixed.replace(/,\s*([\]}])/g, "$1");

      // 2. Fix single quotes
      fixed = fixed.replace(/'([^']*)'/g, '"$1"');

      // 3. Quote unquoted keys
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');

      // Verify
      const parsed = JSON.parse(fixed);
      setOutput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (err: any) {
      setError(
        "Auto-fix failed. The structure might be too complex or malformed."
      );
    }
  }, [input]);

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
  };

  const loadExample = () => {
    const example = {
      project: "DevUtils",
      active: true,
      features: ["Offline", "Secure", "Fast"],
      meta: { created: 2024, author: "Admin" },
    };
    setInput(JSON.stringify(example));
    setTimeout(() => {
      const str = JSON.stringify(example, null, 2);
      setOutput(str);
      setError(null);
    }, 0);
  };

  // Titles for the UI
  const pageTitles = {
    format: "JSON Formatter / Validator",
    minify: "JSON Minifier",
    fix: "JSON Auto-Fixer",
  };

  return (
    <div className="flex flex-col gap-4 h-full min-h-[600px]">
      {/* Page Header for SEO relevance */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {pageTitles[mode]}
        </h1>
        <span className="text-xs text-muted-foreground hidden sm:block">
          {mode === "format" && "Prettify and validate JSON data."}
          {mode === "minify" && "Remove whitespace to reduce size."}
          {mode === "fix" && "Repair broken JSON syntax automatically."}
        </span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex gap-2">
          <Button
            onClick={formatJson}
            size="sm"
            variant={mode === "format" ? "primary" : "secondary"}
          >
            <Maximize2 className="mr-2 h-4 w-4" /> Format
          </Button>
          <Button
            onClick={minifyJson}
            variant={mode === "minify" ? "primary" : "secondary"}
            size="sm"
          >
            <Minimize2 className="mr-2 h-4 w-4" /> Minify
          </Button>
          <Button
            onClick={fixJson}
            variant={mode === "fix" ? "primary" : "outline"}
            size="sm"
            className={
              mode !== "fix"
                ? "border-yellow-500/50 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }
          >
            <Wrench className="mr-2 h-4 w-4" /> Fix
          </Button>
          <div className="w-px h-6 bg-border mx-2" />
          <Button onClick={loadExample} variant="ghost" size="sm">
            Load Example
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={clearAll}
            variant="destructive"
            size="sm"
            title="Clear All"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full overflow-hidden border-border/60 shadow-sm bg-card">
          <MonacoEditor
            value={input}
            onChange={setInput}
            language="json"
            label="Input"
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full overflow-hidden border-border/60 shadow-sm bg-card relative">
          <MonacoEditor
            value={output}
            readOnly
            language="json"
            label="Output"
            lineHighlight="none"
            lineNumbers="off"
            className={`border-none ${error ? "opacity-50" : ""}`}
            actions={
              <Button
                onClick={copyOutput}
                variant="secondary"
                size="sm"
                disabled={!output}
                className="h-6 text-xs px-2"
              >
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            }
          />
          {error && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-800 flex items-start animate-in slide-in-from-bottom-2 z-10">
              <XCircle className="h-5 w-5 mr-2 shrink-0" />
              <span className="break-all font-mono">{error}</span>
            </div>
          )}
          {!error && output && (
            <div className="absolute bottom-0 inset-x-0 p-2 bg-green-50/80 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs border-t border-green-200 dark:border-green-800 flex items-center justify-end z-10 pointer-events-none">
              <CheckCircle className="h-3 w-3 mr-1" />
              Valid JSON
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
