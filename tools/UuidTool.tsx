"use client";

import React, { useState, useEffect } from "react";
import { Button, Input } from "../components/UI";
import {
  Fingerprint,
  Copy,
  RefreshCw,
  Check,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { v1, v4, v6, v7, NIL } from "uuid";
import { useLocalStorage } from "../hooks/useLocalStorage";

type UuidVersion = "v4" | "v1" | "v6" | "v7" | "v8" | "nil";

// RFC 9562 Version 8 (Custom/Experimental)
// Implemented manually as 'uuid' library does not export a generic v8
const generateV8 = (): string => {
  const values = new Uint8Array(16);
  crypto.getRandomValues(values);

  // Version 8 (1000)
  values[6] = (values[6] & 0x0f) | 0x80;
  // Variant (10)
  values[8] = (values[8] & 0x3f) | 0x80;

  return [...values]
    .map((b, i) => {
      const hex = b.toString(16).padStart(2, "0");
      return i === 3 || i === 5 || i === 7 || i === 9 ? hex + "-" : hex;
    })
    .join("");
};

export const UuidTool: React.FC = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useLocalStorage<number>("devutils-uuid-count", 5);
  const [version, setVersion] = useLocalStorage<UuidVersion>(
    "devutils-uuid-version",
    "v7"
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generate = () => {
    // Select generator function based on version
    // Note: v3 and v5 (Namespace) are excluded from bulk generation as they are deterministic
    const fn = {
      v4: v4,
      v1: v1,
      v6: v6,
      v7: v7,
      v8: generateV8,
      nil: () => NIL,
    }[version];

    const newUuids = Array.from(
      { length: Math.min(Math.max(1, count), 100) },
      () => fn()
    );
    setUuids(newUuids);
  };

  // Generate on load
  useEffect(() => {
    if (uuids.length === 0) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(uuids.join("\n"));
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)] min-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
            <Fingerprint className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              UUID Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Generate RFC-compliant UUIDs locally in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
        <div className="flex flex-1 gap-4 items-center w-full md:w-auto">
          <div className="w-36 sm:w-48">
            <label className="text-xs font-medium text-muted-foreground block mb-1.5 ml-1">
              Version
            </label>
            <div className="relative">
              <select
                value={version}
                onChange={(e) => setVersion(e.target.value as UuidVersion)}
                className="w-full appearance-none bg-background border border-input rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="v7">Version 7 (Time-Sortable)</option>
                <option value="v4">Version 4 (Random)</option>
                <option value="v6">Version 6 (Reordered)</option>
                <option value="v1">Version 1 (Mac/Time)</option>
                <option value="v8">Version 8 (Experimental)</option>
                <option value="nil">Nil (Empty)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="w-24 sm:w-32">
            <Input
              type="number"
              label="Quantity"
              value={count}
              onChange={(e) =>
                setCount(
                  Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
                )
              }
              min={1}
              max={100}
              className="h-[38px]"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
          <Button
            onClick={generate}
            className="flex-1 md:flex-none min-w-[120px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Generate
          </Button>
          <Button
            onClick={copyAll}
            variant="secondary"
            className="flex-1 md:flex-none"
            title="Copy All UUIDs"
          >
            {copiedIndex === -1 ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={() => setUuids([])}
            variant="ghost"
            size="md"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results List */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-border/60 bg-card/50 shadow-inner p-2 space-y-1">
        {uuids.map((uuid, index) => (
          <div
            key={`${uuid}-${index}`}
            onClick={() => copyToClipboard(uuid, index)}
            className="group flex items-center justify-between p-2 rounded-md hover:bg-muted/80 cursor-pointer transition-all border border-transparent hover:border-border/50"
            role="button"
            tabIndex={0}
            title="Click to copy"
          >
            <div className="flex items-center gap-4 overflow-hidden">
              <span className="text-xs font-medium text-muted-foreground w-6 text-center">
                {index + 1}
              </span>
              <code className="font-mono text-sm md:text-base text-foreground truncate select-all">
                {uuid}
              </code>
            </div>

            <div className="flex items-center px-2">
              <span
                className={`text-xs font-medium transition-all duration-300 ${copiedIndex === index ? "opacity-100 text-emerald-600 dark:text-emerald-400 translate-x-0" : "opacity-0 translate-x-4"}`}
              >
                Copied!
              </span>
              <div
                className={`ml-3 p-1.5 rounded-md text-muted-foreground transition-colors ${copiedIndex === index ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "group-hover:bg-background group-hover:text-foreground"}`}
              >
                {copiedIndex === index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                )}
              </div>
            </div>
          </div>
        ))}

        {uuids.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
            <RefreshCw className="h-12 w-12 opacity-20" />
            <p>Ready to generate UUIDs</p>
          </div>
        )}
      </div>
    </div>
  );
};
