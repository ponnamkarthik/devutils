"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Binary,
  ArrowRightLeft,
  Copy,
  Check,
  Hash,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Delimiter = "none" | "space" | "colon" | "0x" | "percent";

export const HexTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"text" | "number">("text");

  // --- Text ↔ Hex State ---
  const [input, setInput] = useLocalStorage<string>(
    "hex-text-input",
    "Hello World"
  );
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode"); // encode = text->hex, decode = hex->text
  const [delimiter, setDelimiter] = useLocalStorage<Delimiter>(
    "hex-delimiter",
    "space"
  );
  const [copied, setCopied] = useState(false);

  // --- Number Base State ---
  const [numDec, setNumDec] = useState("255");
  const [numHex, setNumHex] = useState("FF");
  const [numBin, setNumBin] = useState("11111111");
  const [numOct, setNumOct] = useState("377");
  const [numCopied, setNumCopied] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Hex & Number Base Converter - DevUtils";
  }, []);

  // --- Text ↔ Hex Logic ---
  useEffect(() => {
    if (mode === "encode") {
      // Text -> Hex
      const encoder = new TextEncoder();
      const data = encoder.encode(input);
      const hexParts: string[] = [];

      let prefix = "";
      let separator = "";

      switch (delimiter) {
        case "space":
          separator = " ";
          break;
        case "colon":
          separator = ":";
          break;
        case "0x":
          prefix = "0x";
          separator = " ";
          break;
        case "percent":
          prefix = "%";
          break;
        case "none":
        default:
          break;
      }

      for (let i = 0; i < data.length; i++) {
        hexParts.push(
          prefix + data[i].toString(16).padStart(2, "0").toUpperCase()
        );
      }
      setOutput(hexParts.join(separator));
    } else {
      // Hex -> Text
      // 1. Clean input based on heuristic or just strip non-hex chars
      let cleanHex = input;

      // Remove common prefixes/delimiters
      cleanHex = cleanHex
        .replace(/0x/gi, "")
        .replace(/%/g, "")
        .replace(/[^0-9a-fA-F]/g, "");

      if (!cleanHex) {
        setOutput("");
        return;
      }

      if (cleanHex.length % 2 !== 0) {
        // Try to be helpful: assume leading zero if length is 1, otherwise just warn
        if (cleanHex.length === 1) cleanHex = "0" + cleanHex;
        else {
          setOutput("Error: Invalid Hex length (must be even)");
          return;
        }
      }

      try {
        const bytes = new Uint8Array(cleanHex.length / 2);
        for (let i = 0; i < cleanHex.length; i += 2) {
          bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
        }
        const decoder = new TextDecoder();
        setOutput(decoder.decode(bytes));
      } catch (e) {
        setOutput("Error decoding Hex");
      }
    }
  }, [input, mode, delimiter]);

  // --- Number Base Logic ---
  const handleNumChange = (val: string, base: number) => {
    // Remove invalid chars for the target base
    let cleanVal = val;
    if (base === 2) cleanVal = val.replace(/[^01]/g, "");
    else if (base === 8) cleanVal = val.replace(/[^0-7]/g, "");
    else if (base === 10) cleanVal = val.replace(/[^0-9]/g, "");
    else if (base === 16) cleanVal = val.replace(/[^0-9a-fA-F]/g, "");

    if (!cleanVal) {
      setNumDec("");
      setNumHex("");
      setNumBin("");
      setNumOct("");
      return;
    }

    try {
      // Use BigInt for large numbers support
      let bigVal: bigint;
      if (base === 16) bigVal = BigInt("0x" + cleanVal);
      else if (base === 2) bigVal = BigInt("0b" + cleanVal);
      else if (base === 8) bigVal = BigInt("0o" + cleanVal);
      else bigVal = BigInt(cleanVal);

      // Update others
      if (base !== 10) setNumDec(bigVal.toString(10));
      if (base !== 16) setNumHex(bigVal.toString(16).toUpperCase());
      if (base !== 2) setNumBin(bigVal.toString(2));
      if (base !== 8) setNumOct(bigVal.toString(8));

      // Update self to reflect cleaned value
      if (base === 10) setNumDec(cleanVal);
      if (base === 16) setNumHex(cleanVal.toUpperCase());
      if (base === 2) setNumBin(cleanVal);
      if (base === 8) setNumOct(cleanVal);
    } catch (e) {
      // If BigInt fails, just update the specific field
      if (base === 10) setNumDec(cleanVal);
      if (base === 16) setNumHex(cleanVal);
      if (base === 2) setNumBin(cleanVal);
      if (base === 8) setNumOct(cleanVal);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyNum = (val: string, type: string) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setNumCopied(type);
    setTimeout(() => setNumCopied(null), 1500);
  };

  // Swap input/output for convenience
  const handleSwap = () => {
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
            <Binary className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hex Converter
            </h1>
            <p className="text-xs text-muted-foreground">
              Convert text to Hex/ASCII and switch between number bases.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex flex-col gap-6 flex-1 min-h-0">
        {/* Tabs */}
        <div className="flex justify-center flex-none">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab("text")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "text" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <FileText className="h-3.5 w-3.5" /> Text ↔ Hex
            </button>
            <button
              onClick={() => setActiveTab("number")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "number" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Hash className="h-3.5 w-3.5" /> Number Base
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "text" ? (
          <div className="flex flex-col gap-4 flex-1 min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm flex-none">
              <div className="flex items-center gap-3">
                <div className="flex bg-muted rounded-lg p-1">
                  <button
                    onClick={() => setMode("encode")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "encode" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Text <ArrowRight className="h-3 w-3" /> Hex
                  </button>
                  <button
                    onClick={() => setMode("decode")}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "decode" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Hex <ArrowRight className="h-3 w-3" /> Text
                  </button>
                </div>
              </div>

              {mode === "encode" && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    Output Format:
                  </span>
                  <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value as Delimiter)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="none">None (ABC)</option>
                    <option value="space">Space (A B C)</option>
                    <option value="colon">Colon (A:B:C)</option>
                    <option value="0x">0x Prefix (0xA 0xB)</option>
                    <option value="percent">% Prefix (%A%B)</option>
                  </select>
                </div>
              )}

              {mode === "decode" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSwap}
                    className="h-8 text-xs gap-1"
                  >
                    <ArrowRightLeft className="h-3 w-3" /> Swap
                  </Button>
                </div>
              )}
            </div>

            {/* Editors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
              <Card className="flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
                <MonacoEditor
                  label={
                    mode === "encode"
                      ? "Text Input (ASCII / UTF-8)"
                      : "Hex Input"
                  }
                  value={input}
                  onChange={setInput}
                  language="plaintext"
                  className="border-none"
                />
              </Card>
              <Card className="flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden relative">
                <MonacoEditor
                  label={mode === "encode" ? "Hex Output" : "Text Output"}
                  value={output}
                  readOnly
                  language="plaintext"
                  className="border-none"
                  actions={
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyToClipboard}
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
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center flex-1 p-4 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="w-full max-w-3xl p-6 md:p-8 border-border shadow-sm bg-card">
              <div className="flex items-center justify-center mb-8">
                <div className="p-3 bg-primary/10 rounded-full text-primary mr-4">
                  <Hash className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Number Base Converter
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Real-time conversion across common bases.
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                {/* Decimal */}
                <div className="relative">
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block flex justify-between">
                    <span>Decimal</span>
                    <span className="opacity-50 font-mono text-[10px]">
                      Base 10
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        value={numDec}
                        onChange={(e) => handleNumChange(e.target.value, 10)}
                        className="w-full h-12 pl-4 pr-12 rounded-lg border border-input bg-background font-mono text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-3 text-muted-foreground opacity-20 pointer-events-none font-bold text-xl">
                        10
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-12 w-12 p-0 shrink-0"
                      onClick={() => copyNum(numDec, "dec")}
                    >
                      {numCopied === "dec" ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Hexadecimal */}
                <div className="relative">
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block flex justify-between">
                    <span>Hexadecimal</span>
                    <span className="opacity-50 font-mono text-[10px]">
                      Base 16
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-3 text-muted-foreground font-mono text-lg select-none opacity-50">
                        0x
                      </div>
                      <input
                        value={numHex}
                        onChange={(e) => handleNumChange(e.target.value, 16)}
                        className="w-full h-12 pl-12 pr-12 rounded-lg border border-input bg-background font-mono text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all uppercase"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-3 text-muted-foreground opacity-20 pointer-events-none font-bold text-xl">
                        16
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-12 w-12 p-0 shrink-0"
                      onClick={() => copyNum(numHex, "hex")}
                    >
                      {numCopied === "hex" ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Binary */}
                <div className="relative">
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block flex justify-between">
                    <span>Binary</span>
                    <span className="opacity-50 font-mono text-[10px]">
                      Base 2
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-3 text-muted-foreground font-mono text-lg select-none opacity-50">
                        0b
                      </div>
                      <input
                        value={numBin}
                        onChange={(e) => handleNumChange(e.target.value, 2)}
                        className="w-full h-12 pl-12 pr-12 rounded-lg border border-input bg-background font-mono text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-3 text-muted-foreground opacity-20 pointer-events-none font-bold text-xl">
                        2
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-12 w-12 p-0 shrink-0"
                      onClick={() => copyNum(numBin, "bin")}
                    >
                      {numCopied === "bin" ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Octal */}
                <div className="relative">
                  <label className="text-xs font-semibold uppercase text-muted-foreground mb-1.5 block flex justify-between">
                    <span>Octal</span>
                    <span className="opacity-50 font-mono text-[10px]">
                      Base 8
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-3 text-muted-foreground font-mono text-lg select-none opacity-50">
                        0o
                      </div>
                      <input
                        value={numOct}
                        onChange={(e) => handleNumChange(e.target.value, 8)}
                        className="w-full h-12 pl-12 pr-12 rounded-lg border border-input bg-background font-mono text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="0"
                      />
                      <div className="absolute right-3 top-3 text-muted-foreground opacity-20 pointer-events-none font-bold text-xl">
                        8
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      className="h-12 w-12 p-0 shrink-0"
                      onClick={() => copyNum(numOct, "oct")}
                    >
                      {numCopied === "oct" ? (
                        <Check className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
