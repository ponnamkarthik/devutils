"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Search,
  Filter,
  AlertCircle,
  Info,
  Bug,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  FileJson,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

// --- Types ---

interface LogEntry {
  id: number;
  raw: string;
  parsed: any | null;
  level: "error" | "warn" | "info" | "debug" | "unknown";
  timestamp: string | null;
  message: string;
}

// --- Regex Patterns ---

// Common Log Format (CLF)
// Example: 127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
const CLF_REGEX = /^(\S+) (\S+) (\S+) \[([^\]]+)\] "([^"]+)" (\d{3}) (\S+)/;

// --- Helpers ---

const guessLevel = (obj: any): LogEntry["level"] => {
  if (!obj) return "unknown";

  // Look for level/severity keys
  const keys = ["level", "severity", "logLevel", "type"];
  let val = "";

  for (const k of keys) {
    if (obj[k] && typeof obj[k] === "string") {
      val = obj[k].toLowerCase();
      break;
    }
  }

  // Common keywords
  if (val.includes("err") || val.includes("fatal") || val.includes("crit"))
    return "error";
  if (val.includes("warn")) return "warn";
  if (val.includes("info")) return "info";
  if (val.includes("debug") || val.includes("trace") || val.includes("verb"))
    return "debug";

  return "unknown";
};

const guessTimestamp = (obj: any): string | null => {
  if (!obj) return null;
  const keys = ["timestamp", "time", "date", "@timestamp", "ts"];
  for (const k of keys) {
    if (obj[k]) return String(obj[k]);
  }
  return null;
};

const guessMessage = (obj: any): string => {
  if (!obj) return "";
  const keys = ["message", "msg", "error", "err", "text"];
  for (const k of keys) {
    if (obj[k] && typeof obj[k] === "string") return obj[k];
  }
  // Fallback: try to find a string value
  return "";
};

// --- JSON Tree View Component ---
const JsonTreeItem: React.FC<{
  name?: string;
  value: any;
  depth?: number;
  isLast?: boolean;
}> = ({ name, value, depth = 0, isLast = true }) => {
  const [expanded, setExpanded] = useState(depth < 2);
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  if (!isObject) {
    let valColor = "text-green-600 dark:text-green-400";
    if (typeof value === "number")
      valColor = "text-orange-600 dark:text-orange-400";
    if (typeof value === "boolean")
      valColor = "text-blue-600 dark:text-blue-400";
    if (value === null) valColor = "text-gray-500";

    return (
      <div className="font-mono text-xs leading-5 pl-4 flex">
        {name && (
          <span className="text-purple-700 dark:text-purple-400 mr-1 opacity-80">
            {name}:
          </span>
        )}
        <span className={`${valColor} break-all`}>{String(value)}</span>
      </div>
    );
  }

  const keys = Object.keys(value);

  return (
    <div className="font-mono text-xs leading-5">
      <div
        className="flex items-start cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 rounded px-1 -ml-1 transition-colors"
        onClick={toggle}
      >
        <div className="mr-1 mt-0.5 text-muted-foreground opacity-50">
          {!isEmpty &&
            (expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            ))}
        </div>
        <div>
          {name && (
            <span className="text-purple-700 dark:text-purple-400 mr-1 font-semibold">
              {name}:
            </span>
          )}
          <span className="text-foreground opacity-60">
            {isArray ? "[" : "{"}
          </span>
          {!expanded && !isEmpty && (
            <span className="text-muted-foreground mx-1 text-[10px]">...</span>
          )}
          {(isEmpty || !expanded) && (
            <span className="text-foreground opacity-60">
              {isArray ? "]" : "}"}
            </span>
          )}
        </div>
      </div>

      {expanded && !isEmpty && (
        <div className="border-l border-border/40 ml-2 pl-2">
          {keys.map((key, i) => (
            <JsonTreeItem
              key={key}
              name={isArray ? undefined : key}
              value={value[key]}
              depth={depth + 1}
              isLast={i === keys.length - 1}
            />
          ))}
          <div className="text-foreground opacity-60">
            {isArray ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Log Row Component ---
const LogRow = ({ entry }: { entry: LogEntry }) => {
  const [expanded, setExpanded] = useState(false);

  const getLevelIcon = () => {
    switch (entry.level) {
      case "error":
        return <AlertCircle className="h-3.5 w-3.5 text-red-500" />;
      case "warn":
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
      case "debug":
        return <Bug className="h-3.5 w-3.5 text-slate-500" />;
      case "info":
        return <Info className="h-3.5 w-3.5 text-blue-500" />;
      default:
        return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getBorderColor = () => {
    switch (entry.level) {
      case "error":
        return "border-red-500/50 bg-red-500/5 hover:bg-red-500/10";
      case "warn":
        return "border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10";
      case "debug":
        return "border-slate-500/50 hover:bg-muted/50";
      case "info":
        return "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10";
      default:
        return "border-border hover:bg-muted/30";
    }
  };

  return (
    <div className={`border-l-2 ${getBorderColor()} mb-1 transition-colors`}>
      <div
        className="flex items-start gap-3 p-2 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="mt-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 grid gap-1">
          <div className="flex items-center gap-3 text-xs">
            {entry.timestamp && (
              <span className="font-mono text-muted-foreground whitespace-nowrap">
                {entry.timestamp}
              </span>
            )}
            <span
              className={`uppercase font-bold tracking-wider flex items-center gap-1.5 ${
                entry.level === "error"
                  ? "text-red-600 dark:text-red-400"
                  : entry.level === "warn"
                    ? "text-amber-600 dark:text-amber-400"
                    : entry.level === "info"
                      ? "text-blue-600 dark:text-blue-400"
                      : entry.level === "debug"
                        ? "text-slate-600 dark:text-slate-400"
                        : "text-muted-foreground"
              }`}
            >
              {getLevelIcon()}
              {entry.level !== "unknown" ? entry.level : "LOG"}
            </span>
          </div>

          <div className="font-mono text-sm break-all line-clamp-2 text-foreground/90">
            {entry.message ||
              (entry.parsed ? JSON.stringify(entry.parsed) : entry.raw)}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="p-2 pl-9 pr-4 pb-4 border-t border-border/10 bg-background/50">
          {entry.parsed ? (
            <JsonTreeItem value={entry.parsed} />
          ) : (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all font-mono">
              {entry.raw}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export const LogInspectorTool: React.FC = () => {
  const [input, setInput] = useLocalStorage<string>("log-inspector-input", "");
  const [filterText, setFilterText] = useState("");
  const [levels, setLevels] = useState({
    error: true,
    warn: true,
    info: true,
    debug: true,
    unknown: true,
  });

  const [parsedLogs, setParsedLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    document.title = "Log Inspector - DevUtils";
  }, []);

  // Parse logic
  useEffect(() => {
    // Debounce large inputs
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setParsedLogs([]);
        return;
      }
      setIsProcessing(true);

      // Use setTimeout to yield to main thread for UI updates
      setTimeout(() => {
        const lines = input.split(/\r?\n/);
        const entries: LogEntry[] = lines
          .map((line, idx) => {
            if (!line.trim()) return null;

            let parsed: any = null;
            let level: LogEntry["level"] = "unknown";
            let timestamp: string | null = null;
            let message = "";

            // 1. Try to parse JSON
            try {
              // Try to find JSON object in the line (basic extraction if mixed text)
              const firstBrace = line.indexOf("{");
              const lastBrace = line.lastIndexOf("}");
              if (
                firstBrace !== -1 &&
                lastBrace !== -1 &&
                lastBrace > firstBrace
              ) {
                const potentialJson = line.substring(firstBrace, lastBrace + 1);
                parsed = JSON.parse(potentialJson);
                level = guessLevel(parsed);
                timestamp = guessTimestamp(parsed);
                message = guessMessage(parsed);
              }
            } catch (e) {
              /* ignore */
            }

            // 2. If not JSON, try Common Log Format (CLF)
            if (!parsed) {
              const match = line.match(CLF_REGEX);
              if (match) {
                const [_, host, ident, user, time, req, statusStr, size] =
                  match;
                const status = parseInt(statusStr, 10);

                parsed = {
                  host,
                  ident,
                  user,
                  time,
                  request: req,
                  status,
                  size: size === "-" ? 0 : parseInt(size, 10),
                };

                timestamp = time;
                message = `${req} -> ${status}`;

                // Infer level from HTTP status
                if (status >= 500) level = "error";
                else if (status >= 400) level = "warn";
                else level = "info";
              }
            }

            // 3. Fallback: Heuristic Text Scan for Level
            if (level === "unknown") {
              const lower = line.toLowerCase();
              if (
                lower.includes("error") ||
                lower.includes("fail") ||
                lower.includes("exception") ||
                lower.includes("fatal")
              )
                level = "error";
              else if (lower.includes("warn")) level = "warn";
              else if (lower.includes("info")) level = "info";
              else if (lower.includes("debug") || lower.includes("trace"))
                level = "debug";
            }

            return {
              id: idx,
              raw: line,
              parsed,
              level,
              timestamp,
              message: message || line,
            };
          })
          .filter(Boolean) as LogEntry[];

        setParsedLogs(entries);
        setIsProcessing(false);
      }, 10);
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  // Filtering
  const filteredLogs = useMemo(() => {
    const lowerFilter = filterText.toLowerCase();
    return parsedLogs.filter((log) => {
      // Level check
      if (!levels[log.level]) return false;

      // Text check
      if (!lowerFilter) return true;
      return log.raw.toLowerCase().includes(lowerFilter);
    });
  }, [parsedLogs, filterText, levels]);

  const loadSample = () => {
    const sample = `{"level":"info","time":"2023-10-27T10:00:00Z","msg":"Service started","port":8080}
127.0.0.1 - - [10/Oct/2023:13:55:36 -0700] "GET /api/users HTTP/1.0" 200 2326
{"level":"debug","time":"2023-10-27T10:00:05Z","msg":"Connecting to database...","db_host":"localhost"}
192.168.1.50 - - [10/Oct/2023:14:02:11 -0700] "POST /login HTTP/1.1" 401 532
{"level":"warn","time":"2023-10-27T10:00:06Z","msg":"Connection took longer than expected","duration_ms":1500}
2023-10-27 10:01:00 [INFO] Request received path=/api/v1/users
{"level":"error","time":"2023-10-27T10:01:05Z","msg":"Database query failed","error":"Connection refused","stack":"Error: Connection refused\\n    at Client.connect"}
10.0.0.5 - admin [10/Oct/2023:14:10:05 -0700] "DELETE /db/records HTTP/1.1" 500 120
{"level":"info","time":"2023-10-27T10:02:00Z","msg":"Worker processed job","job_id":12345,"status":"completed"}`;
    setInput(sample);
  };

  const toggleLevel = (l: keyof typeof levels) => {
    setLevels((prev) => ({ ...prev, [l]: !prev[l] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] min-h-[600px] gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <FileJson className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Log Inspector
            </h1>
            <p className="text-xs text-muted-foreground">
              Visualize, filter, and inspect structured (JSON) and Web (CLF)
              logs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Input & Controls */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            <div className="p-2 border-b border-border/20 bg-muted/20 flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                Raw Logs
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={loadSample}
                >
                  Sample
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs text-muted-foreground hover:text-destructive"
                  onClick={() => setInput("")}
                >
                  Clear
                </Button>
              </div>
            </div>
            <MonacoEditor
              value={input}
              onChange={setInput}
              language="plaintext" // Plain text is faster/better for raw logs often than JSON if mixed
              className="border-none"
              lineNumbers="off"
            />
          </Card>
        </div>

        {/* Right: Inspector */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-card p-3 rounded-lg border border-border shadow-sm flex-none">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Level Toggles */}
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-md">
              <button
                onClick={() => toggleLevel("error")}
                className={`p-1.5 rounded transition-all ${levels.error ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Toggle Errors"
              >
                <AlertCircle className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleLevel("warn")}
                className={`p-1.5 rounded transition-all ${levels.warn ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Toggle Warnings"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleLevel("info")}
                className={`p-1.5 rounded transition-all ${levels.info ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Toggle Info"
              >
                <Info className="h-4 w-4" />
              </button>
              <button
                onClick={() => toggleLevel("debug")}
                className={`p-1.5 rounded transition-all ${levels.debug ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                title="Toggle Debug"
              >
                <Bug className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 bg-card rounded-lg border border-border shadow-sm overflow-hidden relative">
            {isProcessing && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <span className="text-sm text-muted-foreground animate-pulse">
                  Processing...
                </span>
              </div>
            )}

            <div className="h-full overflow-y-auto custom-scrollbar p-2">
              {filteredLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                  <Filter className="h-10 w-10 opacity-20" />
                  <p className="text-sm">No logs found</p>
                </div>
              ) : (
                filteredLogs.map((log) => <LogRow key={log.id} entry={log} />)
              )}
            </div>

            {/* Status Footer */}
            <div className="bg-muted/30 border-t border-border/40 px-3 py-1.5 text-[10px] text-muted-foreground flex justify-between">
              <span>
                Showing {filteredLogs.length} of {parsedLogs.length} events
              </span>
              <span>Log Inspector</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
