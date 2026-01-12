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
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type KeyValue = { id: number; key: string; value: string; active: boolean };
type AuthType = "none" | "bearer" | "basic";
type CodeFormat = "curl" | "fetch" | "axios";

export const HttpRequestBuilderTool: React.FC = () => {
  const [method, setMethod] = useLocalStorage<string>(
    "http-builder-method",
    "GET"
  );
  const [url, setUrl] = useLocalStorage<string>(
    "http-builder-url",
    "https://api.example.com/v1/users"
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
  const [body, setBody] = useLocalStorage<string>(
    "http-builder-body",
    '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}'
  );

  const [activeTab, setActiveTab] = useState<
    "params" | "auth" | "headers" | "body"
  >("params");
  const [codeFormat, setCodeFormat] = useLocalStorage<CodeFormat>(
    "http-builder-code-format",
    "curl"
  );
  const [copied, setCopied] = useState(false);

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
    } catch (e) {
      // Incomplete URL, ignore params parsing
    }
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

  const addKeyValue = (setter: any, list: KeyValue[]) => {
    setter([...list, { id: Date.now(), key: "", value: "", active: true }]);
  };

  const updateKeyValue = (
    setter: any,
    list: KeyValue[],
    id: number,
    field: keyof KeyValue,
    val: any
  ) => {
    const newList = list.map((item) =>
      item.id === id ? { ...item, [field]: val } : item
    );
    if (setter === setParams) updateUrlFromParams(newList);
    else setter(newList);
  };

  const removeKeyValue = (setter: any, list: KeyValue[], id: number) => {
    const newList = list.filter((item) => item.id !== id);
    if (setter === setParams) updateUrlFromParams(newList);
    else setter(newList);
  };

  const generatedCode = useMemo(() => {
    const activeHeaders: Record<string, string> = {};
    headers
      .filter((h) => h.active && h.key)
      .forEach((h) => (activeHeaders[h.key] = h.value));

    // Add Auth Header
    if (authType === "bearer" && bearerToken) {
      activeHeaders["Authorization"] = `Bearer ${bearerToken}`;
    } else if (authType === "basic") {
      const creds = btoa(`${basicUser}:${basicPass}`);
      activeHeaders["Authorization"] = `Basic ${creds}`;
    }

    // Final URL is already in `url` state (synced with params)
    const finalUrl = url.trim() || "http://localhost";

    if (codeFormat === "curl") {
      let cmd = `curl -X ${method} "${finalUrl}"`;

      Object.entries(activeHeaders).forEach(([k, v]) => {
        cmd += ` \\\n  -H "${k}: ${v}"`;
      });

      if (method !== "GET" && method !== "HEAD" && body) {
        // Escape single quotes for shell
        const safeBody = body.replace(/'/g, "'\\''");
        cmd += ` \\\n  -d '${safeBody}'`;
      }
      return cmd;
    }

    if (codeFormat === "fetch") {
      const options: any = {
        method: method,
        headers: activeHeaders,
      };
      if (method !== "GET" && method !== "HEAD" && body) {
        try {
          JSON.parse(body);
          options.body = "__BODY_PLACEHOLDER__";
        } catch (e) {
          options.body = body; // Raw string
        }
      }

      let code = `fetch("${finalUrl}", ${JSON.stringify(options, null, 2)})`;
      if (options.body === "__BODY_PLACEHOLDER__") {
        code = code.replace(
          '"__BODY_PLACEHOLDER__"',
          `JSON.stringify(${body})`
        );
      }
      return (
        code +
        `\n  .then(response => response.json())\n  .then(data => console.log(data));`
      );
    }

    if (codeFormat === "axios") {
      const config: any = {
        method: method,
        url: finalUrl,
        headers: activeHeaders,
      };

      if (method !== "GET" && method !== "HEAD" && body) {
        try {
          config.data = JSON.parse(body);
        } catch (e) {
          config.data = body;
        }
      }

      return `axios(${JSON.stringify(config, null, 2)})\n  .then(response => console.log(response.data));`;
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
    body,
    codeFormat,
  ]);

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
            <Send className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              HTTP Builder
            </h1>
            <p className="text-xs text-muted-foreground">
              Construct requests and export to cURL, Fetch, or Axios.
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
          disabled
          className="h-10 w-full md:w-24 opacity-80"
          variant="primary"
        >
          <Send className="mr-2 h-4 w-4" /> Send
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* LEFT: Configuration */}
        <div className="flex flex-col gap-4 h-full min-h-[300px]">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            {/* Tabs */}
            <div className="flex items-center border-b border-border/40 bg-muted/20 px-1 pt-1">
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
                                  flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-colors
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
                  {tab.id === "body" && body.length > 10 && (
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
                  <div className="flex items-center justify-between p-2 border-b border-border/40 bg-muted/10">
                    <span className="text-xs text-muted-foreground px-2">
                      JSON Body
                    </span>
                    <button
                      onClick={() => setBody("")}
                      className="text-xs hover:text-destructive px-2"
                    >
                      Clear
                    </button>
                  </div>
                  <MonacoEditor
                    value={body}
                    onChange={setBody}
                    language="json"
                    className="border-none"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT: Code Preview */}
        <div className="flex flex-col gap-4 h-full min-h-[300px]">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Code Snippet
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-background rounded-md border border-input p-0.5">
                  {["curl", "fetch", "axios"].map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setCodeFormat(fmt as any)}
                      className={`
                                          px-2.5 py-1 text-[10px] font-medium rounded-sm uppercase transition-all
                                          ${
                                            codeFormat === fmt
                                              ? "bg-primary text-primary-foreground shadow-sm"
                                              : "text-muted-foreground hover:text-foreground"
                                          }
                                      `}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
                <div className="w-px h-4 bg-border mx-1" />
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
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>

            <div className="flex-1 relative bg-[#1e1e1e]">
              <MonacoEditor
                value={generatedCode}
                language={codeFormat === "curl" ? "shell" : "javascript"}
                readOnly
                lineNumbers="off"
                className="border-none"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
