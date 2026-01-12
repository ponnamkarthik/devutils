"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor, MonacoDiffEditor } from "../components/MonacoEditor";
import { FileDiff, Split, Eraser, Play, ArrowRightLeft } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Language =
  | "plaintext"
  | "javascript"
  | "typescript"
  | "json"
  | "html"
  | "css"
  | "sql"
  | "markdown"
  | "xml";

export const DiffViewerTool: React.FC = () => {
  const [original, setOriginal] = useLocalStorage<string>(
    "devutils-diff-original",
    ""
  );
  const [modified, setModified] = useLocalStorage<string>(
    "devutils-diff-modified",
    ""
  );
  const [language, setLanguage] = useLocalStorage<Language>(
    "devutils-diff-lang",
    "plaintext"
  );
  const [showDiff, setShowDiff] = useState(false);

  const handleClear = () => {
    setOriginal("");
    setModified("");
    setShowDiff(false);
  };

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  const loadExample = () => {
    setLanguage("javascript");
    setOriginal(`function calculateTotal(price, tax) {
  return price + (price * tax);
}

const result = calculateTotal(100, 0.1);
console.log("Total: " + result);`);
    setModified(`function calculateTotal(price, tax, discount = 0) {
  const subtotal = price + (price * tax);
  return subtotal - discount;
}

const result = calculateTotal(100, 0.1, 5);
console.log(\`Final Total: \${result}\`);`);
    setShowDiff(true);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <FileDiff className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Diff Viewer
            </h1>
            <p className="text-xs text-muted-foreground">
              Compare two text blocks to see differences, additions, and
              deletions.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="plaintext">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
            <option value="markdown">Markdown</option>
            <option value="xml">XML</option>
          </select>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setShowDiff(false)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${!showDiff ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Edit Inputs
            </button>
            <button
              onClick={() => setShowDiff(true)}
              className={`flex items-center gap-2 px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${showDiff ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Split className="h-3.5 w-3.5" />
              View Diff
            </button>
          </div>

          {!showDiff && (
            <Button
              onClick={handleSwap}
              variant="ghost"
              size="sm"
              title="Swap Original and Modified"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
          )}

          <Button onClick={loadExample} variant="ghost" size="sm">
            Example
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleClear}
            variant="destructive"
            size="sm"
            title="Clear All"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 relative">
        {showDiff ? (
          <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card overflow-hidden">
            <MonacoDiffEditor
              original={original}
              modified={modified}
              language={language}
              className="border-none"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card">
              <MonacoEditor
                label="Original (Left)"
                value={original}
                onChange={setOriginal}
                language={language}
                className="border-none"
              />
            </Card>
            <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card">
              <MonacoEditor
                label="Modified (Right)"
                value={modified}
                onChange={setModified}
                language={language}
                className="border-none"
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
