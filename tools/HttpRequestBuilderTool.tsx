"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card, Input } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Send,
  Plus,
  Trash2,
  Code,
  Key,
  Settings,
  Copy,
  Check,
  Lock,
  ChevronDown,
  ChevronRight,
  FileCode,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Database,
  Globe,
  Upload,
  FileText,
  Type,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type KeyValue = { id: number; key: string; value: string; active: boolean };
type BodyItem = {
  id: number;
  key: string;
  value: string;
  active: boolean;
  type: "text" | "file";
  fileName?: string;
};
type AuthType = "none" | "bearer" | "basic";
type CodeFormat = "curl" | "fetch" | "axios";
type BodyType = "json" | "form-data" | "urlencoded";

export const HttpRequestBuilderTool: React.FC = () => {
  const [method, setMethod] = useLocalStorage<string>(
    "http-builder-method",
    "GET"
  );
  const [url, setUrl] = useLocalStorage<string>(
    "http-builder-url",
    "https://jsonplaceholder.typicode.com/todos/1"
  );
  const [params, setParams] = useLocalStorage<KeyValue[]>(
    "http-builder-params",
    []
  );
  const [headers, setHeaders] = useLocalStorage<KeyValue[]>(
    "http-builder-headers",
    [
      { id: 1, key: "Content-Type", value: "application/json", active: true },
      { id: 2, key: "Accept", value: "application/json", active: true },
    ]
  );

  // Auth
  const [authType, setAuthType] = useLocalStorage<AuthType>(
    "http-builder-auth-type",
    "none"
  );
  const [bearerToken, setBearerToken] = useLocalStorage<string>(
    "http-builder-auth-bearer",
    ""
  );
  const [basicUser, setBasicUser] = useLocalStorage<string>(
    "http-builder-auth-user",
    ""
  );
  const [basicPass, setBasicPass] = useLocalStorage<string>(
    "http-builder-auth-pass",
    ""
  );

  // Body
  const [bodyType, setBodyType] = useLocalStorage<BodyType>(
    "http-builder-body-type",
    "json"
  );
  const [jsonBody, setJsonBody] = useLocalStorage<string>(
    "http-builder-body",
    '{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}'
  );
  const [bodyParams, setBodyParams] = useLocalStorage<BodyItem[]>(
    "http-builder-body-params",
    []
  );

  // Ephemeral state for files (cannot be in local storage)
  const [files, setFiles] = useState<Record<number, File>>({});

  const [activeTab, setActiveTab] = useState<
    "params" | "auth" | "headers" | "body"
  >("params");
  const [codeFormat, setCodeFormat] = useLocalStorage<CodeFormat>(
    "http-builder-code-format",
    "curl"
  );
  const [copied, setCopied] = useState(false);

  // Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<"code" | "response">(
    "code"
  );
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    time: number;
    size: number;
  } | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "HTTP Request Builder - DevUtils";
  }, []);

  // --- Sync URL and Params ---
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    try {
      const u = new URL(newUrl);
      const newParams: KeyValue[] = [];
      let id = 1;
      u.searchParams.forEach((val, key) => {
        newParams.push({ id: id++, key, value: val, active: true });
      });
      setParams(newParams);
    } catch (e) {}
  };

  const updateUrlFromParams = (newParams: KeyValue[]) => {
    setParams(newParams);
    try {
      let baseUrl = url.split("?")[0];
      if (!baseUrl) return;

      const qs = new URLSearchParams();
      newParams.forEach((p) => {
        if (p.active && p.key) qs.append(p.key, p.value);
      });

      const queryString = qs.toString();
      setUrl(queryString ? `${baseUrl}?${queryString}` : baseUrl);
    } catch (e) {}
  };

  // --- Helpers ---
  const addKeyValue = (setter: any, list: any[]) => {
    setter([
      ...list,
      { id: Date.now(), key: "", value: "", active: true, type: "text" },
    ]);
  };

  const updateKeyValue = (
    setter: any,
    list: any[],
    id: number,
    field: string,
    val: any
  ) => {
    const newList = list.map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    if (setter === setParams) updateUrlFromParams(newList);
    else setter(newList);
  };

  const handleFileSelect = (id: number, file: File | null) => {
    if (file) {
      setFiles((prev) => ({ ...prev, [id]: file }));
      updateKeyValue(setBodyParams, bodyParams, id, "fileName", file.name);
    } else {
      const newFiles = { ...files };
      delete newFiles[id];
      setFiles(newFiles);
      updateKeyValue(setBodyParams, bodyParams, id, "fileName", undefined);
    }
  };

  const removeKeyValue = (setter: any, list: any[], id: number) => {
    const newList = list.filter((item) => item.id !== id);
    if (setter === setParams) updateUrlFromParams(newList);
    else setter(newList);

    // Cleanup files if needed
    if (setter === setBodyParams) {
      const newFiles = { ...files };
      delete newFiles[id];
      setFiles(newFiles);
    }
  };

  // --- Code Generation ---
  const generatedCode = useMemo(() => {
    const activeHeaders: Record<string, string> = {};
    headers
      .filter((h) => h.active && h.key)
      .forEach((h) => (activeHeaders[h.key] = h.value));

    if (authType === "bearer" && bearerToken) {
      activeHeaders["Authorization"] = `Bearer ${bearerToken}`;
    } else if (authType === "basic") {
      const creds = btoa(`${basicUser}:${basicPass}`);
      activeHeaders["Authorization"] = `Basic ${creds}`;
    }

    // Automatically adjust Content-Type based on body type for the snippet
    if (method !== "GET" && method !== "HEAD") {
      if (bodyType === "json") {
        activeHeaders["Content-Type"] = "application/json";
      } else if (bodyType === "urlencoded") {
        activeHeaders["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (bodyType === "form-data") {
        // For snippets, we usually show no Content-Type or multipart/form-data; boundary=...
        // Fetch/Axios handle this automatically, so we remove it to be cleaner
        delete activeHeaders["Content-Type"];
      }
    }

    const finalUrl = url.trim() || "http://localhost";

    if (codeFormat === "curl") {
      let cmd = `curl -X ${method} "${finalUrl}"`;
      Object.entries(activeHeaders).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });

      if (method !== "GET" && method !== "HEAD") {
        if (bodyType === "json" && jsonBody) {
          const safeBody = jsonBody.replace(/'/g, "'\\''");
          cmd += ` \\\n  -d '${safeBody}'`;
        } else if (bodyType === "urlencoded") {
          bodyParams
            .filter((p) => p.active && p.key)
            .forEach((p) => {
              cmd += ` \\\n  -d "${p.key}=${p.value}"`;
            });
        } else if (bodyType === "form-data") {
          bodyParams
            .filter((p) => p.active && p.key)
            .forEach((p) => {
              if (p.type === "file") {
                cmd += ` \\\n  -F "${p.key}=@${p.fileName || "/path/to/file"}"`;
              } else {
                cmd += ` \\\n  -F "${p.key}=${p.value}"`;
              }
            });
        }
      }
      return cmd;
    }

    if (codeFormat === "fetch") {
      let bodyCode = "";
      if (method !== "GET" && method !== "HEAD") {
        if (bodyType === "json") {
          // Basic JSON logic
          bodyCode = `  body: JSON.stringify(${jsonBody.replace(/\n/g, "")})`;
        } else if (bodyType === "urlencoded") {
          const paramsObj = bodyParams
            .filter((p) => p.active && p.key)
            .map((p) => `    ["${p.key}", "${p.value}"]`)
            .join(",\n");
          bodyCode = `  body: new URLSearchParams([\n${paramsObj}\n  ])`;
        } else if (bodyType === "form-data") {
          // FormData logic
          let fdLines = `const formData = new FormData();\n`;
          bodyParams
            .filter((p) => p.active && p.key)
            .forEach((p) => {
              if (p.type === "file") {
                fdLines += `formData.append("${p.key}", fileInput.files[0], "${p.fileName || "file"}");\n`;
              } else {
                fdLines += `formData.append("${p.key}", "${p.value}");\n`;
              }
            });
          return `${fdLines}\nfetch("${finalUrl}", {\n  method: "${method}",\n  headers: ${JSON.stringify(activeHeaders, null, 2)},\n  body: formData\n})\n  .then(response => response.json())\n  .then(data => console.log(data));`;
        }
      }

      const options = {
        method: method,
        headers: activeHeaders,
      };

      let code = `fetch("${finalUrl}", ${JSON.stringify(options, null, 2).replace("}", bodyCode ? "," + bodyCode + "\n}" : "}")})`;
      return (
        code +
        `\n  .then(response => response.json())\n  .then(data => console.log(data));`
      );
    }

    if (codeFormat === "axios") {
      let dataSection = "";
      if (method !== "GET" && method !== "HEAD") {
        if (bodyType === "json") {
          try {
            JSON.parse(jsonBody);
            dataSection = `  data: ${jsonBody}`;
          } catch (e) {
            dataSection = `  data: \`${jsonBody}\``;
          }
        } else if (bodyType === "urlencoded") {
          const paramsObj = bodyParams
            .filter((p) => p.active && p.key)
            .reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {});
          dataSection = `  data: ${JSON.stringify(paramsObj, null, 2)}`;
        } else if (bodyType === "form-data") {
          let fdLines = `const formData = new FormData();\n`;
          bodyParams
            .filter((p) => p.active && p.key)
            .forEach((p) => {
              if (p.type === "file") {
                fdLines += `formData.append("${p.key}", fileInput.files[0]);\n`;
              } else {
                fdLines += `formData.append("${p.key}", "${p.value}");\n`;
              }
            });
          return `${fdLines}\naxios({\n  method: "${method}",\n  url: "${finalUrl}",\n  headers: ${JSON.stringify(activeHeaders, null, 2)},\n  data: formData\n})\n  .then(response => console.log(response.data));`;
        }
      }

      const config: any = {
        method: method,
        url: finalUrl,
        headers: activeHeaders,
      };
      let code = `axios(${JSON.stringify(config, null, 2)})`;
      if (dataSection) {
        code = code.replace("}", "," + dataSection + "\n}");
      }
      return code + `\n  .then(response => console.log(response.data));`;
    }
    return "";
  }, [
    url,
    method,
    headers,
    authType,
    bearerToken,
    basicUser,
    basicPass,
    bodyType,
    jsonBody,
    bodyParams,
    codeFormat,
  ]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Execution Logic ---
  const handleSend = async () => {
    if (!url) return;

    setIsLoading(true);
    setFetchError(null);
    setResponse(null);
    setRightPanelMode("response");

    const startTime = performance.now();

    try {
      const activeHeaders: Record<string, string> = {};
      headers
        .filter((h) => h.active && h.key)
        .forEach((h) => (activeHeaders[h.key] = h.value));

      if (authType === "bearer" && bearerToken) {
        activeHeaders["Authorization"] = `Bearer ${bearerToken}`;
      } else if (authType === "basic") {
        const creds = btoa(`${basicUser}:${basicPass}`);
        activeHeaders["Authorization"] = `Basic ${creds}`;
      }

      const options: RequestInit = {
        method: method,
        headers: activeHeaders,
      };

      if (method !== "GET" && method !== "HEAD") {
        if (bodyType === "json") {
          options.body = jsonBody;
          // Ensure Content-Type is set if user didn't set it, or respect user setting
          if (!activeHeaders["Content-Type"]) {
            // We need to construct a new headers object to avoid mutating state indirectly or failing if it's read-only
            options.headers = {
              ...activeHeaders,
              "Content-Type": "application/json",
            };
          }
        } else if (bodyType === "urlencoded") {
          const usp = new URLSearchParams();
          bodyParams.forEach((p) => {
            if (p.active && p.key) usp.append(p.key, p.value);
          });
          options.body = usp;
          // Browser sets content type automatically or we can force it
        } else if (bodyType === "form-data") {
          const fd = new FormData();
          bodyParams.forEach((p) => {
            if (p.active && p.key) {
              if (p.type === "file") {
                const file = files[p.id];
                if (file) {
                  fd.append(p.key, file);
                }
              } else {
                fd.append(p.key, p.value);
              }
            }
          });
          options.body = fd;
          // IMPORTANT: Do NOT set Content-Type header for FormData, browser does it with boundary
          if (options.headers && "Content-Type" in options.headers) {
            // @ts-ignore
            delete options.headers["Content-Type"];
          }
        }
      }

      const res = await fetch(url, options);
      const endTime = performance.now();

      // Process response
      const blob = await res.blob();
      const text = await blob.text();
      const size = blob.size;

      // Pretty print JSON if possible
      let formattedBody = text;
      try {
        formattedBody = JSON.stringify(JSON.parse(text), null, 2);
      } catch (e) {}

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => (resHeaders[key] = val));

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: formattedBody,
        time: Math.round(endTime - startTime),
        size,
      });
    } catch (e: any) {
      console.error(e);
      setFetchError(
        e.message === "Failed to fetch"
          ? "Network Error: The request failed. This is often due to CORS (Cross-Origin Resource Sharing) restrictions when calling APIs from a browser-based tool. Try a CORS-enabled API or localhost."
          : e.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300)
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (status >= 300 && status < 400)
      return "text-blue-500 bg-blue-500/10 border-blue-500/20";
    if (status >= 400 && status < 500)
      return "text-orange-500 bg-orange-500/10 border-orange-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const KeyValueEditor = ({
    items,
    setter,
  }: {
    items: KeyValue[];
    setter: any;
  }) => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">
            No items. Click + to add.
          </div>
        )}
        {items.map((item) => (
          <div key={item.id} className="flex gap-2 items-center group">
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) =>
                updateKeyValue(
                  setter,
                  items,
                  item.id,
                  "active",
                  e.target.checked
                )
              }
              className="rounded border-input text-primary focus:ring-primary"
            />
            <input
              value={item.key}
              onChange={(e) =>
                updateKeyValue(setter, items, item.id, "key", e.target.value)
              }
              placeholder="Key"
              className="flex-1 min-w-0 h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:border-primary"
            />
            <input
              value={item.value}
              onChange={(e) =>
                updateKeyValue(setter, items, item.id, "value", e.target.value)
              }
              placeholder="Value"
              className="flex-1 min-w-0 h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => removeKeyValue(setter, items, item.id)}
              className="text-muted-foreground hover:text-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-border/40">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => addKeyValue(setter, items)}
          className="w-full text-xs border border-dashed border-border hover:border-primary/50"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Item
        </Button>
      </div>
    </div>
  );

  const BodyParamsEditor = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {bodyParams.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-8">
            No items. Click + to add.
          </div>
        )}
        {bodyParams.map((item) => (
          <div key={item.id} className="flex gap-2 items-center group">
            <input
              type="checkbox"
              checked={item.active}
              onChange={(e) =>
                updateKeyValue(
                  setBodyParams,
                  bodyParams,
                  item.id,
                  "active",
                  e.target.checked
                )
              }
              className="rounded border-input text-primary focus:ring-primary shrink-0"
            />
            <input
              value={item.key}
              onChange={(e) =>
                updateKeyValue(
                  setBodyParams,
                  bodyParams,
                  item.id,
                  "key",
                  e.target.value
                )
              }
              placeholder="Key"
              className="flex-1 min-w-0 h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:border-primary"
            />

            {bodyType === "form-data" && (
              <div className="relative shrink-0">
                <select
                  value={item.type}
                  onChange={(e) =>
                    updateKeyValue(
                      setBodyParams,
                      bodyParams,
                      item.id,
                      "type",
                      e.target.value
                    )
                  }
                  className="h-8 rounded border border-input bg-background pl-2 pr-6 text-xs appearance-none focus:outline-none focus:border-primary w-20"
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                </select>
                <div className="absolute right-2 top-2 pointer-events-none text-muted-foreground">
                  {item.type === "text" ? (
                    <Type className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                </div>
              </div>
            )}

            {item.type === "file" ? (
              <div className="flex-1 min-w-0 flex items-center h-8 gap-2">
                <label className="flex-1 h-full cursor-pointer">
                  <div
                    className={`h-full w-full rounded border border-input px-2 flex items-center text-xs ${files[item.id] ? "bg-primary/10 text-primary border-primary/20" : "bg-background text-muted-foreground"}`}
                  >
                    <Upload className="h-3 w-3 mr-2 shrink-0" />
                    <span className="truncate">
                      {files[item.id]?.name || item.fileName || "Select File"}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(item.id, e.target.files?.[0] || null)
                    }
                  />
                </label>
              </div>
            ) : (
              <input
                value={item.value}
                onChange={(e) =>
                  updateKeyValue(
                    setBodyParams,
                    bodyParams,
                    item.id,
                    "value",
                    e.target.value
                  )
                }
                placeholder="Value"
                className="flex-1 min-w-0 h-8 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:border-primary"
              />
            )}

            <button
              onClick={() => removeKeyValue(setBodyParams, bodyParams, item.id)}
              className="text-muted-foreground hover:text-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-border/40">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => addKeyValue(setBodyParams, bodyParams)}
          className="w-full text-xs border border-dashed border-border hover:border-primary/50"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Field
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              HTTP Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Construct and execute HTTP requests directly from your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Main Request Bar */}
      <div className="flex flex-col md:flex-row gap-3 bg-card p-4 rounded-lg border border-border shadow-sm">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary w-full md:w-32"
        >
          {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map(
            (m) => (
              <option key={m} value={m}>
                {m}
              </option>
            )
          )}
        </select>
        <div className="flex-1 relative">
          <input
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="w-full h-10 pl-3 pr-3 rounded-md border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            placeholder="https://api.example.com/endpoint"
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={isLoading || !url}
          className="h-10 w-full md:w-28"
          variant="primary"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* LEFT: Configuration */}
        <div className="flex flex-col gap-4 h-full min-h-[300px]">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-border/40 bg-muted/20 px-1 pt-1 overflow-x-auto no-scrollbar">
              {[
                { id: "params", label: "Params", icon: Settings },
                { id: "auth", label: "Auth", icon: Lock },
                { id: "headers", label: "Headers", icon: Code },
                { id: "body", label: "Body", icon: FileCode },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                                  flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap
                                  ${
                                    activeTab === tab.id
                                      ? "border-primary text-primary bg-background rounded-t-md"
                                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                  }
                              `}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                  {/* Simple dot indicator if active/populated */}
                  {tab.id === "params" && params.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 ml-1" />
                  )}
                  {tab.id === "auth" && authType !== "none" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 ml-1" />
                  )}
                  {tab.id === "body" &&
                    (bodyType !== "json" || jsonBody.length > 10) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary/50 ml-1" />
                    )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 bg-card min-h-0 relative">
              {activeTab === "params" && (
                <KeyValueEditor items={params} setter={setParams} />
              )}
              {activeTab === "headers" && (
                <KeyValueEditor items={headers} setter={setHeaders} />
              )}

              {activeTab === "auth" && (
                <div className="p-4 space-y-6">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">
                      Authorization Type
                    </label>
                    <select
                      value={authType}
                      onChange={(e) => setAuthType(e.target.value as AuthType)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                    </select>
                  </div>

                  {authType === "bearer" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-1">
                      <label className="text-xs font-semibold uppercase text-muted-foreground">
                        Token
                      </label>
                      <Input
                        placeholder="eyJhbGci..."
                        value={bearerToken}
                        onChange={(e) => setBearerToken(e.target.value)}
                      />
                    </div>
                  )}

                  {authType === "basic" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">
                          Username
                        </label>
                        <Input
                          placeholder="admin"
                          value={basicUser}
                          onChange={(e) => setBasicUser(e.target.value)}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase text-muted-foreground">
                          Password
                        </label>
                        <Input
                          type="password"
                          placeholder="••••••"
                          value={basicPass}
                          onChange={(e) => setBasicPass(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "body" && (
                <div className="flex flex-col h-full">
                  {/* Body Type Selector */}
                  <div className="flex items-center justify-between p-2 border-b border-border/40 bg-muted/10">
                    <div className="flex bg-background border border-input rounded p-0.5">
                      {(["json", "form-data", "urlencoded"] as const).map(
                        (t) => (
                          <button
                            key={t}
                            onClick={() => setBodyType(t)}
                            className={`px-3 py-1 text-[10px] font-medium uppercase rounded-sm transition-all ${bodyType === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {t.replace("urlencoded", "url-encoded")}
                          </button>
                        )
                      )}
                    </div>
                    {bodyType === "json" && (
                      <button
                        onClick={() => setJsonBody("")}
                        className="text-xs hover:text-destructive px-2"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 relative">
                    {bodyType === "json" ? (
                      <MonacoEditor
                        value={jsonBody}
                        onChange={setJsonBody}
                        language="json"
                        className="border-none"
                      />
                    ) : (
                      <BodyParamsEditor />
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT: Code / Response */}
        <div className="flex flex-col gap-4 h-full min-h-[300px]">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            {/* Right Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
              <div className="flex bg-background rounded-md border border-input p-0.5">
                <button
                  onClick={() => setRightPanelMode("code")}
                  className={`px-3 py-1 text-[10px] font-medium rounded-sm uppercase transition-all flex items-center gap-1.5 ${rightPanelMode === "code" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Code className="h-3 w-3" /> Code
                </button>
                <button
                  onClick={() => setRightPanelMode("response")}
                  className={`px-3 py-1 text-[10px] font-medium rounded-sm uppercase transition-all flex items-center gap-1.5 ${rightPanelMode === "response" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Globe className="h-3 w-3" /> Response
                </button>
              </div>

              {rightPanelMode === "code" && (
                <div className="flex items-center gap-2">
                  <div className="flex bg-background rounded-md border border-input p-0.5">
                    {["curl", "fetch", "axios"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setCodeFormat(fmt as any)}
                        className={`
                                              px-2 py-1 text-[10px] font-medium rounded-sm uppercase transition-all
                                              ${
                                                codeFormat === fmt
                                                  ? "bg-muted text-foreground"
                                                  : "text-muted-foreground hover:text-foreground"
                                              }
                                          `}
                      >
                        {fmt}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyCode}
                    className="h-7 text-xs px-2 gap-1.5"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Panel Content */}
            <div className="flex-1 relative bg-card min-h-0 flex flex-col">
              {rightPanelMode === "code" ? (
                <div className="flex-1 bg-[#1e1e1e]">
                  <MonacoEditor
                    value={generatedCode}
                    language={codeFormat === "curl" ? "shell" : "javascript"}
                    readOnly
                    lineNumbers="off"
                    className="border-none"
                  />
                </div>
              ) : (
                // Response View
                <div className="flex-1 flex flex-col relative overflow-hidden">
                  {isLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm">Sending Request...</span>
                    </div>
                  ) : fetchError ? (
                    <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95">
                      <div className="p-3 bg-destructive/10 rounded-full text-destructive">
                        <AlertTriangle className="h-8 w-8" />
                      </div>
                      <div className="max-w-xs space-y-2">
                        <h3 className="font-semibold text-foreground">
                          Request Failed
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {fetchError}
                        </p>
                      </div>
                    </div>
                  ) : response ? (
                    <div className="flex flex-col h-full animate-in fade-in">
                      {/* Response Meta */}
                      <div className="flex items-center gap-4 px-4 py-2 border-b border-border/40 text-xs bg-muted/10 flex-none">
                        <div
                          className={`px-2 py-0.5 rounded font-bold border ${getStatusColor(response.status)}`}
                        >
                          {response.status} {response.statusText}
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{response.time}ms</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Database className="h-3.5 w-3.5" />
                          <span>{formatSize(response.size)}</span>
                        </div>
                      </div>

                      {/* Response Body */}
                      <div className="flex-1 relative">
                        <MonacoEditor
                          value={response.body}
                          language="json"
                          readOnly
                          lineNumbers="on"
                          className="border-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground/50">
                      <Send className="h-10 w-10 opacity-20" />
                      <span className="text-sm">
                        Click Send to execute request
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
