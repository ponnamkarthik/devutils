"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, CodeEditor, Card } from "../components/UI";
import { Upload, X, Copy, Check } from "lucide-react";

interface Base64ToolProps {
  mode?: "encode" | "decode";
}

export const Base64Tool: React.FC<Base64ToolProps> = ({ mode = "encode" }) => {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (input) {
      process(input, mode as "encode" | "decode");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const process = (val: string, currentMode: "encode" | "decode") => {
    try {
      if (!val) {
        setOutput("");
        return;
      }
      if (currentMode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        setOutput(decodeURIComponent(escape(atob(val))));
      }
    } catch (e) {
      setOutput("Error: Invalid input for " + currentMode);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setFileName(null); // Clear file mode if typing
    process(val, mode as "encode" | "decode");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    if (mode === "encode") {
      reader.onload = (evt) => {
        const res = evt.target?.result as string;
        const b64 = res.split(",")[1];
        setInput(`[Binary File: ${file.name}]`);
        setOutput(b64);
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (evt) => {
        const res = evt.target?.result as string;
        setInput(res);
        process(res, "decode");
      };
      reader.readAsText(file);
    }
  };

  const setMode = (newMode: "encode" | "decode") => {
    if (newMode !== mode) {
      router.push(`/base64/${newMode}`);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode("encode")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === "encode" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Encode
            </button>
            <button
              onClick={() => setMode("decode")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${mode === "decode" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Decode
            </button>
          </div>

          <div className="relative">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {fileName ? "Change File" : "Load File"}
            </Button>
          </div>
          {fileName && (
            <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 px-2 py-1 rounded-full flex items-center">
              {fileName}
              <X
                className="ml-1 h-3 w-3 cursor-pointer"
                onClick={() => {
                  setFileName(null);
                  setInput("");
                  setOutput("");
                }}
              />
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50">
          <CodeEditor
            label={mode === "encode" ? "Plain Text / Input" : "Base64 String"}
            value={input}
            onChange={handleInputChange}
            placeholder={
              mode === "encode"
                ? "Type text to encode..."
                : "Paste Base64 to decode..."
            }
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4"
            readOnly={!!fileName && mode === "encode"}
          />
        </Card>
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card/50 relative">
          <div className="absolute top-2 right-2 z-10">
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              size="sm"
              disabled={!output}
              className="h-7 text-xs shadow-sm"
            >
              {copied ? (
                <Check className="h-3 w-3 mr-1" />
              ) : (
                <Copy className="h-3 w-3 mr-1" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <CodeEditor
            label={mode === "encode" ? "Base64 Output" : "Plain Text Output"}
            value={output}
            readOnly
            placeholder="Result..."
            className="flex-1 resize-none border-0 focus-visible:ring-0 rounded-none bg-muted/30 p-4"
          />
        </Card>
      </div>
    </div>
  );
};
