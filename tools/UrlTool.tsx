"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Link,
  Search,
  Globe,
  Plus,
  Trash2,
  ArrowRightLeft,
  Copy,
  Check,
  Settings2,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface UrlToolProps {
  mode?: "parser" | "encoder" | "decoder";
}

export const UrlTool: React.FC<UrlToolProps> = ({ mode = "parser" }) => {
  const router = useRouter();

  const [urlInput, setUrlInput] = useLocalStorage<string>(
    "devutils-url-parser-input",
    "https://www.example.com:8080/path/to/resource?search=query&filter=active#section-1"
  );
  const [parsed, setParsed] = useState<URL | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [params, setParams] = useState<
    { key: string; value: string; id: number }[]
  >([]);

  const [encodeInput, setEncodeInput] = useLocalStorage<string>(
    "devutils-url-encode-input",
    "https://example.com/search?q=hello world&lang=en"
  );
  const [encodeOutput, setEncodeOutput] = useState("");
  const [encodeMethod, setEncodeMethod] = useState<"component" | "uri">(
    "component"
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      let inputToParse = urlInput;
      if (
        !inputToParse.match(/^[a-zA-Z]+:\/\//) &&
        inputToParse.includes(".")
      ) {
      }

      const u = new URL(inputToParse);
      setParsed(u);
      setParseError(null);

      const newParams: { key: string; value: string; id: number }[] = [];
      let idCounter = 0;
      u.searchParams.forEach((value, key) => {
        newParams.push({ key, value, id: idCounter++ });
      });
      setParams(newParams);
    } catch (e) {
      setParsed(null);
      setParseError("Invalid URL");
      setParams([]);
    }
  }, [urlInput]);

  const updateUrlFromComponents = (
    updates: Partial<{
      protocol: string;
      hostname: string;
      port: string;
      pathname: string;
      hash: string;
    }>
  ) => {
    if (!parsed) return;
    try {
      const u = new URL(parsed.toString());
      if (updates.protocol !== undefined)
        u.protocol = updates.protocol.replace(/:$/, "");
      if (updates.hostname !== undefined) u.hostname = updates.hostname;
      if (updates.port !== undefined) u.port = updates.port;
      if (updates.pathname !== undefined) u.pathname = updates.pathname;
      if (updates.hash !== undefined) u.hash = updates.hash;

      setUrlInput(u.toString());
    } catch (e) {}
  };

  const updateParam = (
    id: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const newParams = params.map((p) =>
      p.id === id ? { ...p, [field]: newValue } : p
    );
    rebuildUrl(newParams);
  };

  const removeParam = (id: number) => {
    const newParams = params.filter((p) => p.id !== id);
    rebuildUrl(newParams);
  };

  const addParam = () => {
    const newParams = [...params, { key: "", value: "", id: Date.now() }];
    rebuildUrl(newParams);
  };

  const rebuildUrl = (currentParams: typeof params) => {
    if (!parsed) return;
    const u = new URL(parsed.toString());

    const newSearchParams = new URLSearchParams();
    currentParams.forEach((p) => {
      if (p.key) newSearchParams.append(p.key, p.value);
    });

    u.search = newSearchParams.toString();
    setUrlInput(u.toString());
    setParams(currentParams);
  };

  useEffect(() => {
    try {
      if (!encodeInput) {
        setEncodeOutput("");
        return;
      }

      if (mode === "encoder") {
        if (encodeMethod === "component") {
          setEncodeOutput(encodeURIComponent(encodeInput));
        } else {
          setEncodeOutput(encodeURI(encodeInput));
        }
      } else {
        if (encodeMethod === "component") {
          setEncodeOutput(decodeURIComponent(encodeInput));
        } else {
          setEncodeOutput(decodeURI(encodeInput));
        }
      }
    } catch (e) {
      setEncodeOutput("Error: Malformed URI sequence");
    }
  }, [encodeInput, mode, encodeMethod]);

  const copyEncoderOutput = () => {
    navigator.clipboard.writeText(encodeOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setEncodeMode = (newMode: "encoder" | "decoder") => {
    router.push(`/url/${newMode === "encoder" ? "encode" : "decode"}`);
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Link className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              URL Tools
            </h1>
            <p className="text-xs text-muted-foreground">
              Parse, build, encode, and decode URLs.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar / Tabs */}
      <div className="flex flex-col gap-4 bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex justify-center pb-2 border-b border-border/40 mb-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => router.push("/url/parser")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === "parser" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Search className="h-4 w-4" /> Parser & Builder
            </button>
            <button
              onClick={() => router.push("/url/encode")}
              className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${mode === "encoder" || mode === "decoder" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <ArrowRightLeft className="h-4 w-4" /> Encoder / Decoder
            </button>
          </div>
        </div>

        {/* --- PARSER CONTENT --- */}
        {mode === "parser" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Main Input */}
            <div className="relative">
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                Full URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className={`w-full h-10 pl-9 pr-3 rounded-md border bg-background text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary ${parseError ? "border-destructive focus:ring-destructive" : "border-input"}`}
                  placeholder="https://example.com"
                />
              </div>
              {parseError && (
                <p className="text-xs text-destructive mt-1">{parseError}</p>
              )}
            </div>

            {/* Components Grid */}
            {parsed && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <Input
                      label="Protocol"
                      value={parsed.protocol}
                      onChange={(e) =>
                        updateUrlFromComponents({ protocol: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <Input
                      label="Host"
                      value={parsed.hostname}
                      onChange={(e) =>
                        updateUrlFromComponents({ hostname: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      label="Port"
                      value={parsed.port}
                      onChange={(e) =>
                        updateUrlFromComponents({ port: e.target.value })
                      }
                      placeholder="80"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <Input
                      label="Path"
                      value={parsed.pathname}
                      onChange={(e) =>
                        updateUrlFromComponents({ pathname: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-4">
                    <Input
                      label="Hash (Fragment)"
                      value={parsed.hash}
                      onChange={(e) =>
                        updateUrlFromComponents({ hash: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Query Params Section */}
                <div className="md:col-span-4 flex flex-col h-full border border-border/60 rounded-lg bg-muted/10 overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-border/40 bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Settings2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Query Params
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={addParam}
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px]">
                    {params.length === 0 && (
                      <div className="text-center text-xs text-muted-foreground py-8">
                        No query parameters.
                      </div>
                    )}
                    {params.map((p) => (
                      <div key={p.id} className="flex gap-2 items-center group">
                        <input
                          value={p.key}
                          onChange={(e) =>
                            updateParam(p.id, "key", e.target.value)
                          }
                          placeholder="Key"
                          className="flex-1 min-w-0 h-8 rounded border border-input bg-background px-2 text-xs"
                        />
                        <span className="text-muted-foreground text-xs">=</span>
                        <input
                          value={p.value}
                          onChange={(e) =>
                            updateParam(p.id, "value", e.target.value)
                          }
                          placeholder="Value"
                          className="flex-1 min-w-0 h-8 rounded border border-input bg-background px-2 text-xs"
                        />
                        <button
                          onClick={() => removeParam(p.id)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ENCODER CONTENT --- */}
        {(mode === "encoder" || mode === "decoder") && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 min-h-[400px]">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setEncodeMode("encoder")}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "encoder" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Encode
                </button>
                <button
                  onClick={() => setEncodeMode("decoder")}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${mode === "decoder" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Decode
                </button>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Method:</label>
                <select
                  value={encodeMethod}
                  onChange={(e) => setEncodeMethod(e.target.value as any)}
                  className="h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="component">URIComponent (Strict)</option>
                  <option value="uri">URI (Loose)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="flex flex-col gap-2 h-full">
                <label className="text-xs font-medium text-muted-foreground">
                  Input
                </label>
                <Card className="flex-1 p-0 border-border/60 bg-card shadow-sm overflow-hidden">
                  <MonacoEditor
                    value={encodeInput}
                    onChange={setEncodeInput}
                    language="plaintext"
                    className="border-none"
                    lineNumbers="off"
                  />
                </Card>
              </div>
              <div className="flex flex-col gap-2 h-full">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-muted-foreground">
                    Output
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyEncoderOutput}
                    className="h-5 text-[10px] px-2 gap-1"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
                <Card className="flex-1 p-0 border-border/60 bg-muted/10 shadow-sm overflow-hidden">
                  <MonacoEditor
                    value={encodeOutput}
                    readOnly
                    language="plaintext"
                    className="border-none bg-transparent"
                    lineNumbers="off"
                  />
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
