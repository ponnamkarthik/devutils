"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { Button, CodeEditor, Card } from "../components/UI";
import {
  Sheet,
  FileJson,
  ArrowRightLeft,
  Upload,
  X,
  Download,
  AlertCircle,
  Loader2,
  Copy,
  Check,
} from "lucide-react";

interface CsvJsonToolProps {
  mode?: "json" | "csv"; // Target format
}

export const CsvJsonTool: React.FC<CsvJsonToolProps> = ({ mode = "json" }) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileObject, setFileObject] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Clean state when mode changes
  useEffect(() => {
    setInput("");
    setOutput("");
    setFileName(null);
    setFileObject(null);
    setError(null);
    setStats(null);
    setCopied(false);
  }, [mode]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileObject(file);
    setInput(
      `[File Loaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB)]`
    );
    setError(null);
    setOutput("");
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setFileName(null);
    setFileObject(null);
    setError(null);
    setStats(null);
    setCopied(false);
    // Reset file input value if needed
    const fileInput = document.getElementById(
      "csv-file-upload"
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleConvert = () => {
    setError(null);
    setStats(null);
    setIsProcessing(true);

    // Give UI a moment to update processing state
    setTimeout(() => {
      if (mode === "json") {
        convertCsvToJson();
      } else {
        convertJsonToCsv();
      }
    }, 50);
  };

  const convertCsvToJson = () => {
    const source = fileObject || input;

    if (!source) {
      setIsProcessing(false);
      return;
    }

    Papa.parse(source as any, {
      header: true,
      skipEmptyLines: "greedy", // Handle trailing newlines and whitespace more robustly
      worker: !!fileObject, // Use worker if it's a file
      complete: (results) => {
        setIsProcessing(false);

        if (
          (!results.data || results.data.length === 0) &&
          results.errors.length > 0
        ) {
          // Show first error
          setError(
            `Parse Error (Line ${results.errors[0].row}): ${results.errors[0].message}`
          );
          return;
        }

        const jsonStr = JSON.stringify(results.data, null, 2);

        if (jsonStr.length > 5 * 1024 * 1024) {
          setOutput(
            jsonStr.substring(0, 10000) +
              "\n\n... [Output too large for preview, please download result] ..."
          );
        } else {
          setOutput(jsonStr);
        }

        let statusMsg = `Parsed ${results.data.length} rows.`;
        if (results.errors.length > 0) {
          statusMsg += ` Warning: ${results.errors.length} parsing issues detected (e.g. Line ${results.errors[0].row || "N/A"}: ${results.errors[0].message})`;
        }

        setStats(statusMsg);
        setError(null);
      },
      error: (err) => {
        setIsProcessing(false);
        setError(err.message);
      },
    });
  };

  const convertJsonToCsv = () => {
    const processJson = (jsonString: string) => {
      try {
        const data = JSON.parse(jsonString);
        const csv = Papa.unparse(data);
        setOutput(csv);
        setStats(
          `Generated CSV with ${Array.isArray(data) ? data.length : "N/A"} rows.`
        );
      } catch (e: any) {
        setError("Invalid JSON: " + e.message);
      } finally {
        setIsProcessing(false);
      }
    };

    if (fileObject) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          processJson(e.target.result as string);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsProcessing(false);
      };
      reader.readAsText(fileObject);
    } else {
      if (!input.trim()) {
        setIsProcessing(false);
        return;
      }
      processJson(input);
    }
  };

  const handleDownload = () => {
    if ((!output && !fileObject) || error) return;

    if (!output.includes("... [Output too large")) {
      const blobType = mode === "json" ? "application/json" : "text/csv";
      const extension = mode === "json" ? "json" : "csv";
      const blob = new Blob([output], { type: blobType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted.${extension}`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    alert("Output is large. Re-processing for download...");

    if (mode === "json" && fileObject) {
      Papa.parse(fileObject, {
        header: true,
        skipEmptyLines: "greedy",
        worker: true,
        complete: (results) => {
          const jsonStr = JSON.stringify(results.data, null, 2);
          const blob = new Blob([jsonStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `converted.json`;
          a.click();
          URL.revokeObjectURL(url);
        },
      });
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setMode = (newMode: "json" | "csv") => {
    router.push(`/csv/${newMode}`);
  };

  const loadExample = () => {
    clearAll();
    if (mode === "json") {
      setInput("id,name,role\n1,Alice,Admin\n2,Bob,User\n3,Charlie,User");
    } else {
      setInput(
        '[\n  {"id": 1, "name": "Alice", "role": "Admin"},\n  {"id": 2, "name": "Bob", "role": "User"}\n]'
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
            <Sheet className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              CSV Converter
            </h1>
            <p className="text-xs text-muted-foreground">
              {mode === "json" ? "Convert CSV to JSON" : "Convert JSON to CSV"}.
              Supports large files.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex bg-muted rounded-lg p-1 mr-2">
            <button
              onClick={() => setMode("json")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mode === "json" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              CSV <ArrowRightLeft className="h-3 w-3" /> JSON
            </button>
            <button
              onClick={() => setMode("csv")}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${mode === "csv" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              JSON <ArrowRightLeft className="h-3 w-3" /> CSV
            </button>
          </div>

          <div className="relative">
            <input
              type="file"
              id="csv-file-upload"
              className="hidden"
              accept={mode === "json" ? ".csv,.txt" : ".json,.txt"}
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById("csv-file-upload")?.click()
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              {fileName ? "Change File" : "Load File"}
            </Button>
          </div>
          {fileName && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full flex items-center max-w-[150px] truncate">
              {fileName}
              <X
                className="ml-1 h-3 w-3 cursor-pointer shrink-0"
                onClick={clearAll}
              />
            </span>
          )}

          <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

          <Button onClick={handleConvert} size="sm" disabled={isProcessing}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ArrowRightLeft className="mr-2 h-4 w-4" />
            )}
            Convert
          </Button>

          <Button
            onClick={handleDownload}
            variant="secondary"
            size="sm"
            disabled={!output || isProcessing}
          >
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>

          <Button onClick={loadExample} variant="ghost" size="sm">
            Example
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50">
          <CodeEditor
            label={mode === "json" ? "CSV Input" : "JSON Input"}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (fileObject) {
                setFileObject(null);
                setFileName(null);
                // Clear file input if user types manually
                const fileInput = document.getElementById(
                  "csv-file-upload"
                ) as HTMLInputElement;
                if (fileInput) fileInput.value = "";
              }
            }}
            placeholder={
              mode === "json"
                ? "Paste CSV here or load a file..."
                : "Paste JSON here or load a file..."
            }
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 font-mono text-sm"
            readOnly={!!fileObject}
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50 relative overflow-hidden">
          <CodeEditor
            label={mode === "json" ? "JSON Output" : "CSV Output"}
            value={output}
            readOnly
            placeholder="Result will appear here..."
            className={`flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-muted/30 p-4 font-mono text-sm ${error ? "opacity-50" : ""}`}
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
              <span className="font-mono break-all">{error}</span>
            </div>
          )}

          {stats && !error && (
            <div
              className={`absolute bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-2 px-4 flex items-center justify-between text-xs animate-in slide-in-from-bottom-2 ${stats.includes("Warning") ? "text-yellow-600 dark:text-yellow-400" : "text-muted-foreground"}`}
            >
              <span>{stats}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
