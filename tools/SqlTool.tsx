"use client";

import React, { useState, useEffect } from "react";
import { format } from "sql-formatter";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Database,
  Play,
  Eraser,
  Copy,
  Check,
  AlertCircle,
  Minimize2,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export const SqlTool: React.FC = () => {
  const [input, setInput] = useLocalStorage<string>("devutils-sql-input", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dialect, setDialect] = useLocalStorage<string>(
    "devutils-sql-dialect",
    "sql"
  );
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const formatted = format(input, {
        language: dialect as any,
        tabWidth: 2,
        keywordCase: "upper",
        linesBetweenQueries: 2,
      });
      setOutput(formatted);
      setError(null);
    } catch (e: any) {
      // sql-formatter might throw validation errors
      setError(e.message || "Failed to format SQL. Check your syntax.");
    }
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    try {
      // Basic SQL minification strategy
      let minified = input
        // Remove single line comments (careful with strings, but decent for dev tools)
        .replace(/--.*/g, "")
        // Remove multi-line comments
        .replace(/\/\*[\s\S]*?\*\//g, "")
        // Replace multiple spaces/newlines with single space
        .replace(/\s+/g, " ")
        // Remove spaces around common delimiters for extra compactness
        .replace(/\s?([(),])\s?/g, "$1")
        .trim();

      setOutput(minified);
      setError(null);
    } catch (e: any) {
      setError("Failed to minify SQL.");
    }
  };

  const loadExample = () => {
    setInput(
      "select id, name, email from users where active = 1 and created_at > '2023-01-01' order by name desc limit 10;"
    );
    setError(null);
    // Use timeout to allow state update before formatting
    setTimeout(() => {
      try {
        const val =
          "select id, name, email from users where active = 1 and created_at > '2023-01-01' order by name desc limit 10;";
        const formatted = format(val, {
          language: dialect as any,
          tabWidth: 2,
          keywordCase: "upper",
        });
        setOutput(formatted);
      } catch (e) {}
    }, 0);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              SQL Formatter
            </h1>
            <p className="text-xs text-muted-foreground">
              Beautify or minify SQL queries for better readability or
              embedding.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          <select
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-medium"
          >
            <option value="sql">Standard SQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="mysql">MySQL / MariaDB</option>
            <option value="sqlite">SQLite</option>
            <option value="transactsql">T-SQL (SQL Server)</option>
            <option value="plsql">PL/SQL (Oracle)</option>
          </select>

          <Button onClick={handleFormat} size="sm" className="min-w-[100px]">
            <Play className="mr-2 h-4 w-4" /> Format
          </Button>

          <Button onClick={handleMinify} variant="secondary" size="sm">
            <Minimize2 className="mr-2 h-4 w-4" /> Minify
          </Button>

          <div className="w-px h-6 bg-border mx-1" />

          <Button onClick={loadExample} variant="ghost" size="sm">
            Example
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setInput("");
              setOutput("");
              setError(null);
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
            label="Raw SQL Input"
            value={input}
            onChange={setInput}
            language="sql"
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card relative overflow-hidden">
          <MonacoEditor
            label="Output"
            value={output}
            readOnly
            language="sql"
            lineNumbers="off"
            lineHighlight="none"
            className={`border-none ${error ? "opacity-50" : ""}`}
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

          {error && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-800 flex items-start animate-in slide-in-from-bottom-2 z-10">
              <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
              <span className="font-mono">{error}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
