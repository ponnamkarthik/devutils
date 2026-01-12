"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CodeEditor } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  ArrowRightLeft,
  FileJson,
  FileText,
  Copy,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
// @ts-ignore
import yaml from "js-yaml";

interface YamlJsonToolProps {
  mode: "yaml2json" | "json2yaml";
}

export const YamlJsonTool: React.FC<YamlJsonToolProps> = ({ mode }) => {
  const router = useRouter();
  const [input, setInput] = useLocalStorage<string>("devutils-yaml-input", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (input) handleConvert();
  }, [mode]);

  const handleConvert = () => {
    setError(null);
    setIsProcessing(true);

    // Small delay to allow UI to update
    setTimeout(() => {
      try {
        if (!input.trim()) {
          setOutput("");
          setIsProcessing(false);
          return;
        }

        let result = "";
        if (mode === "yaml2json") {
          const obj = yaml.load(input);
          result = JSON.stringify(obj, null, 2);
        } else {
          const obj = JSON.parse(input);
          result = yaml.dump(obj);
        }
        setOutput(result);
      } catch (e: any) {
        setError(e.message || "Conversion failed");
        setOutput("");
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const setMode = (newMode: "yaml2json" | "json2yaml") => {
    if (newMode !== mode) {
      if (output && !error) {
        setInput(output);
        setOutput("");
      }
      router.push(newMode === "yaml2json" ? "/yaml/json" : "/yaml/yaml");
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    if (mode === "yaml2json") {
      setInput(`name: DevUtils
version: 1.0.0
features:
  - Offline
  - Fast
settings:
  theme: dark
  notifications: true`);
    } else {
      setInput(`{
  "name": "DevUtils",
  "version": "1.0.0",
  "features": [
    "Offline",
    "Fast"
  ],
  "settings": {
    "theme": "dark",
    "notifications": true
  }
}`);
    }
    // Trigger conversion
    setTimeout(handleConvert, 100);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              YAML Converter
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "yaml2json"
                ? "Convert YAML to JSON"
                : "Convert JSON to YAML"}
              . Validates syntax automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-muted rounded-lg p-1 mr-2">
            <button
              onClick={() => setMode("yaml2json")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mode === "yaml2json" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              YAML <ArrowRightLeft className="h-3 w-3" /> JSON
            </button>
            <button
              onClick={() => setMode("json2yaml")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mode === "json2yaml" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              JSON <ArrowRightLeft className="h-3 w-3" /> YAML
            </button>
          </div>

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Button onClick={handleConvert} size="sm" disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
            Convert
          </Button>

          <Button onClick={loadExample} variant="ghost" size="sm">
            Example
          </Button>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50">
          <MonacoEditor
            label={mode === "yaml2json" ? "YAML Input" : "JSON Input"}
            value={input}
            onChange={setInput}
            language={mode === "yaml2json" ? "yaml" : "json"}
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50 relative overflow-hidden">
          <MonacoEditor
            label={mode === "yaml2json" ? "JSON Output" : "YAML Output"}
            value={output}
            readOnly
            language={mode === "yaml2json" ? "json" : "yaml"}
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
            <div className="absolute bottom-0 inset-x-0 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-800 flex items-start animate-in slide-in-from-bottom-2">
              <AlertCircle className="h-5 w-5 mr-2 shrink-0" />
              <span className="font-mono break-all whitespace-pre-wrap max-h-32 overflow-y-auto">
                {error}
              </span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
