import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  ArrowRightLeft,
  FileJson,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Braces,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
// @ts-ignore
import JSON5 from "json5";

interface Json5ToolProps {
  mode: "json52json" | "json2json5";
}

export const Json5Tool: React.FC<Json5ToolProps> = ({ mode }) => {
  const navigate = useNavigate();
  const [input, setInput] = useLocalStorage<string>("devutils-json5-input", "");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    document.title =
      mode === "json52json"
        ? "JSON5 to JSON Converter - DevUtils"
        : "JSON to JSON5 Converter - DevUtils";
  }, [mode]);

  useEffect(() => {
    if (input) handleConvert();
  }, [mode]);

  const handleConvert = () => {
    setError(null);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        if (!input.trim()) {
          setOutput("");
          setIsProcessing(false);
          return;
        }

        let result = "";
        if (mode === "json52json") {
          // JSON5 -> JSON (Strict)
          const obj = JSON5.parse(input);
          result = JSON.stringify(obj, null, 2);
        } else {
          // JSON -> JSON5 (Token-Oriented)
          // We first parse to ensure validity, then stringify with JSON5
          // Note: JSON5.stringify(obj, null, 2) produces quoted keys by default in some versions,
          // but usually produces unquoted keys where valid identifiers.
          // The ESM build of JSON5 v2+ produces unquoted keys.
          const obj =
            mode === "json2json5" ? JSON.parse(input) : JSON5.parse(input);
          result = JSON5.stringify(obj, null, 2);
        }
        setOutput(result);
      } catch (e: any) {
        setError(e.message || "Conversion failed. Check your syntax.");
        setOutput("");
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  };

  const setMode = (newMode: "json52json" | "json2json5") => {
    if (newMode !== mode) {
      if (output && !error) {
        setInput(output);
        setOutput("");
      }
      navigate(newMode === "json52json" ? "/json5/json" : "/json5/json5");
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = () => {
    if (mode === "json52json") {
      setInput(`{
  // Comments are allowed!
  /* Multi-line too */
  unquotedKey: 'Single quotes allowed',
  trailingComma: true,
  hexadecimal: 0xDEADBEEF,
  leadingDecimal: .8675309,
  andTrailing: 8675309.,
  positiveSign: +1,
  
  // Line breaks in strings
  multiLineString: "Line 1 \\
Line 2"
}`);
    } else {
      setInput(`{
  "title": "Strict JSON",
  "description": "Keys must be quoted. No comments allowed.",
  "count": 100,
  "isActive": true,
  "tags": [
    "json",
    "strict"
  ]
}`);
    }
    setTimeout(handleConvert, 100);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded-lg">
            <Braces className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              JSON5 Converter
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "json52json"
                ? "Convert JSON5 (Token-Oriented) to JSON"
                : "Convert JSON to JSON5"}
              .
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-muted rounded-lg p-1 mr-2">
            <button
              onClick={() => setMode("json52json")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mode === "json52json" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              JSON5 <ArrowRightLeft className="h-3 w-3" /> JSON
            </button>
            <button
              onClick={() => setMode("json2json5")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mode === "json2json5" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              JSON <ArrowRightLeft className="h-3 w-3" /> JSON5
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
            label={mode === "json52json" ? "JSON5 Input" : "JSON Input"}
            value={input}
            onChange={setInput}
            language={mode === "json52json" ? "javascript" : "json"} // JS highlighting works well for JSON5
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50 relative overflow-hidden">
          <MonacoEditor
            label={mode === "json52json" ? "JSON Output" : "JSON5 Output"}
            value={output}
            readOnly
            language={mode === "json52json" ? "json" : "javascript"}
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
