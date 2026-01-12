"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Input } from "../components/UI";
import {
  Clock,
  Play,
  Pause,
  Copy,
  Check,
  Calendar,
  ArrowRight,
  RefreshCw,
  Hash,
} from "lucide-react";

export const UnixTimeTool: React.FC = () => {
  const [now, setNow] = useState(Date.now());
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // Converter States
  const [tsInput, setTsInput] = useState("");
  const [dateInput, setDateInput] = useState(() =>
    new Date().toISOString().slice(0, 16)
  ); // YYYY-MM-DDTHH:mm

  // Live Clock
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Copy Helper
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const getTsResult = () => {
    if (!tsInput.trim()) return null;
    let val = parseInt(tsInput.trim());
    if (isNaN(val)) return null;

    // Auto-detect seconds vs millis (Seconds usually < 100000000000 for next few centuries)
    let isSeconds = false;
    if (Math.abs(val) < 100000000000) {
      val *= 1000;
      isSeconds = true;
    }

    const date = new Date(val);

    // Relative Time
    const diff = (Date.now() - date.getTime()) / 1000;
    let relative = "";
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    if (Math.abs(diff) < 60) relative = rtf.format(-Math.round(diff), "second");
    else if (Math.abs(diff) < 3600)
      relative = rtf.format(-Math.round(diff / 60), "minute");
    else if (Math.abs(diff) < 86400)
      relative = rtf.format(-Math.round(diff / 3600), "hour");
    else if (Math.abs(diff) < 2592000)
      relative = rtf.format(-Math.round(diff / 86400), "day");
    else if (Math.abs(diff) < 31536000)
      relative = rtf.format(-Math.round(diff / 2592000), "month");
    else relative = rtf.format(-Math.round(diff / 31536000), "year");

    return {
      valid: !isNaN(date.getTime()),
      isSeconds,
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      iso: date.toISOString(),
      relative,
    };
  };

  const tsResult = getTsResult();

  const getDateResult = () => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return {
      seconds: Math.floor(date.getTime() / 1000),
      millis: date.getTime(),
    };
  };

  const dateResult = getDateResult();

  // Helpers
  const setInputToNow = () => {
    setTsInput(Math.floor(Date.now() / 1000).toString());
  };

  return (
    <div className="flex flex-col gap-6 w-full h-full min-h-[600px]">
      {/* Header & Live Clock */}
      <div className="flex flex-col gap-6 items-center py-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Unix Timestamp Converter
          </h1>
          <p className="text-muted-foreground">
            Epoch time converter for developers.
          </p>
        </div>

        <Card className="p-6 flex flex-col items-center gap-4 bg-card border-primary/20 shadow-lg min-w-[300px] sm:min-w-[400px]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> Current Unix Time
          </div>
          <div className="flex items-center gap-4">
            <span className="text-4xl sm:text-5xl font-mono font-bold text-primary tabular-nums tracking-tight">
              {Math.floor(now / 1000)}
            </span>
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPaused(!isPaused)}
                className="h-7 w-7 p-0 rounded-full hover:bg-muted text-muted-foreground"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(Math.floor(now / 1000).toString(), "live")
                }
                className="h-7 w-7 p-0 rounded-full hover:bg-muted text-muted-foreground"
                title="Copy"
              >
                {copied === "live" ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
            {new Date(now).toUTCString()}
          </div>
        </Card>
      </div>

      {/* Converters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-start">
        {/* Left: Timestamp -> Human */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded">
              <Hash className="h-4 w-4" />
            </div>
            <h2 className="font-semibold">Timestamp to Date</h2>
          </div>
          <Card className="p-6 space-y-6 border-border/60 shadow-md h-full">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Enter Timestamp (Seconds or Milliseconds)
              </label>
              <div className="flex gap-2">
                <Input
                  value={tsInput}
                  onChange={(e) => setTsInput(e.target.value)}
                  placeholder={`e.g. ${Math.floor(Date.now() / 1000)}`}
                  className="font-mono text-base"
                />
                <Button variant="secondary" onClick={setInputToNow}>
                  Now
                </Button>
              </div>
            </div>

            {tsResult && tsResult.valid ? (
              <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-muted/30 rounded-lg border border-border/50 space-y-3">
                  <div className="flex justify-between items-center text-xs text-muted-foreground uppercase tracking-wider border-b border-border/40 pb-2">
                    <span>Results</span>
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
                      Detected:{" "}
                      {tsResult.isSeconds ? "Seconds" : "Milliseconds"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        GMT / UTC
                      </div>
                      <div className="font-mono text-sm font-medium break-all">
                        {tsResult.utc}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Your Local Time
                      </div>
                      <div className="font-mono text-sm font-medium break-all">
                        {tsResult.local}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        ISO 8601
                      </div>
                      <div className="font-mono text-sm font-medium text-blue-600 dark:text-blue-400 break-all select-all">
                        {tsResult.iso}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-0.5">
                        Relative
                      </div>
                      <div className="font-mono text-sm font-medium">
                        {tsResult.relative}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : tsInput ? (
              <div className="p-4 text-center text-destructive text-sm bg-destructive/10 rounded-lg">
                Invalid Timestamp format
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                Enter a timestamp to see details
              </div>
            )}
          </Card>
        </div>

        {/* Right: Date -> Timestamp */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded">
              <Calendar className="h-4 w-4" />
            </div>
            <h2 className="font-semibold">Date to Timestamp</h2>
          </div>
          <Card className="p-6 space-y-6 border-border/60 shadow-md h-full">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Select Date & Time (Local)
              </label>
              <input
                type="datetime-local"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                step="1"
              />
            </div>

            {dateResult ? (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                <div className="grid gap-3">
                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Unix Timestamp (Seconds)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(dateResult.seconds.toString(), "sec")
                        }
                        className="h-6 w-6 p-0"
                      >
                        {copied === "sec" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="text-xl font-mono font-bold text-foreground tracking-wide">
                      {dateResult.seconds}
                    </div>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg border border-border/50 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold uppercase text-muted-foreground">
                        Unix Timestamp (Millis)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(dateResult.millis.toString(), "ms")
                        }
                        className="h-6 w-6 p-0"
                      >
                        {copied === "ms" ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    <div className="text-base font-mono font-medium text-muted-foreground tracking-wide">
                      {dateResult.millis}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-lg">
                Select a date to generate timestamp
              </div>
            )}

            {/* Presets */}
            <div className="pt-4 border-t border-border/40">
              <label className="text-xs font-medium text-muted-foreground mb-3 block">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const d = new Date();
                    d.setHours(0, 0, 0, 0);
                    setDateInput(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    );
                  }}
                  className="text-xs"
                >
                  Start of Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const d = new Date();
                    d.setHours(23, 59, 59, 999);
                    setDateInput(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    );
                  }}
                  className="text-xs"
                >
                  End of Day
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(1);
                    d.setHours(0, 0, 0, 0);
                    setDateInput(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    );
                  }}
                  className="text-xs"
                >
                  Start of Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const d = new Date();
                    d.setFullYear(d.getFullYear(), 0, 1);
                    d.setHours(0, 0, 0, 0);
                    setDateInput(
                      new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                        .toISOString()
                        .slice(0, 16)
                    );
                  }}
                  className="text-xs"
                >
                  Start of Year
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
