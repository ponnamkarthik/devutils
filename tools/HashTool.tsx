"use client";

import React, { useState, useEffect } from "react";
import { Button, CodeEditor, Card } from "../components/UI";
import { Hash, Copy, Check, Upload, X } from "lucide-react";

type Algorithm = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";

export const HashTool: React.FC = () => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [uppercase, setUppercase] = useState(false);
  const [copied, setCopied] = useState(false);

  const [fileObject, setFileObject] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const calculateHash = async (data: BufferSource) => {
    try {
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      let hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (uppercase) {
        hashHex = hashHex.toUpperCase();
      }
      setOutput(hashHex);
    } catch (e) {
      console.error(e);
      setOutput("Error calculating hash");
    }
  };

  useEffect(() => {
    const process = async () => {
      if (fileObject) {
        // File Mode
        try {
          const buffer = await fileObject.arrayBuffer();
          calculateHash(buffer);
        } catch (e) {
          setOutput("Error reading file");
        }
      } else {
        // Text Mode
        if (!input) {
          setOutput("");
          return;
        }
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        calculateHash(data);
      }
    };

    process();
  }, [input, algorithm, uppercase, fileObject]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileObject(file);
    setInput(""); // Clear text input visual
  };

  const clearFile = () => {
    setFileObject(null);
    setFileName(null);
    setInput("");
    setOutput("");
    // Reset input value to allow re-selection
    const el = document.getElementById("hash-file-upload") as HTMLInputElement;
    if (el) el.value = "";
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-500/10 text-cyan-500 rounded-lg">
            <Hash className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hash Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Secure, offline cryptographic hashing using native browser APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as Algorithm)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-medium"
          >
            <option value="SHA-1">SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-384">SHA-384</option>
            <option value="SHA-512">SHA-512</option>
          </select>

          <button
            onClick={() => setUppercase(!uppercase)}
            className={`px-3 py-1.5 h-9 text-sm font-medium rounded-md border transition-all ${uppercase ? "bg-primary/10 border-primary text-primary" : "bg-background border-input text-muted-foreground hover:bg-muted"}`}
          >
            Uppercase
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <div className="relative">
            <input
              type="file"
              id="hash-file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                document.getElementById("hash-file-upload")?.click()
              }
            >
              <Upload className="mr-2 h-4 w-4" />
              {fileName ? "Change File" : "Hash File"}
            </Button>
          </div>
          {fileName && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full flex items-center max-w-[200px] truncate">
              {fileName}
              <X
                className="ml-1 h-3 w-3 cursor-pointer shrink-0"
                onClick={clearFile}
              />
            </span>
          )}
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Input Area */}
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50">
          <CodeEditor
            label={fileObject ? "File Input" : "Text Input"}
            value={
              fileObject
                ? `[File Selected: ${fileName}]\n\nSize: ${fileObject.size} bytes`
                : input
            }
            onChange={(e) => {
              if (fileObject) clearFile();
              setInput(e.target.value);
            }}
            placeholder="Type text here to hash..."
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 font-mono text-sm"
            readOnly={!!fileObject}
          />
        </Card>

        {/* Output Area */}
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50 relative">
          <CodeEditor
            label="Hash Output"
            value={output}
            readOnly
            placeholder="Hash will appear here..."
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-muted/30 p-4 font-mono text-sm break-all"
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
          {output && (
            <div className="absolute bottom-0 inset-x-0 bg-background/95 backdrop-blur border-t border-border p-2 px-4 text-xs text-muted-foreground flex justify-between">
              <span>Algorithm: {algorithm}</span>
              <span>Length: {output.length} chars</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
