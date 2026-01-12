"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Card } from "../components/UI";
import {
  Activity,
  RefreshCw,
  Wifi,
  WifiOff,
  ArrowDown,
  Clock,
  Zap,
} from "lucide-react";

// Using a high-bandwidth public asset from Wikimedia Commons (approx 10MB)
// We add a timestamp to prevent caching.
const TEST_FILE_URL =
  "https://upload.wikimedia.org/wikipedia/commons/f/ff/Pizigani_1367_Chart_10MB.jpg";
const FILE_SIZE_BYTES = 10596000; // Approx 10.1 MB

type TestState = "idle" | "pinging" | "downloading" | "finished" | "error";

export const SpeedTestTool: React.FC = () => {
  const [state, setState] = useState<TestState>("idle");
  const [speed, setSpeed] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    document.title = "Internet Speed Test - DevUtils";
    return () => {
      if (abortController.current) abortController.current.abort();
    };
  }, []);

  const runTest = async () => {
    if (!navigator.onLine) {
      setErrorMsg("You are offline.");
      setState("error");
      return;
    }

    setState("pinging");
    setSpeed(0);
    setLatency(0);
    setProgress(0);
    setErrorMsg(null);
    abortController.current = new AbortController();

    try {
      // 1. Latency Test
      const pingStart = performance.now();
      await fetch(TEST_FILE_URL + "?t=" + Date.now(), {
        method: "HEAD",
        signal: abortController.current.signal,
        cache: "no-store",
      });
      const pingEnd = performance.now();
      setLatency(Math.round(pingEnd - pingStart));

      // 2. Download Test
      setState("downloading");
      const downloadStart = performance.now();

      const response = await fetch(TEST_FILE_URL + "?t=" + Date.now(), {
        signal: abortController.current.signal,
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      let receivedLength = 0;
      let lastUiUpdate = 0;

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        receivedLength += value.length;

        const now = performance.now();
        // Update UI every 100ms to avoid freezing
        if (now - lastUiUpdate > 100) {
          const durationSeconds = (now - downloadStart) / 1000;
          // Bits per second
          const bps = (receivedLength * 8) / durationSeconds;
          // Mbps
          const mbps = bps / 1000000;

          setSpeed(mbps);
          setProgress((receivedLength / FILE_SIZE_BYTES) * 100);
          lastUiUpdate = now;
        }
      }

      const downloadEnd = performance.now();
      const totalDuration = (downloadEnd - downloadStart) / 1000;
      const finalMbps = (receivedLength * 8) / totalDuration / 1000000;

      setSpeed(finalMbps);
      setProgress(100);
      setState("finished");
    } catch (err: any) {
      if (err.name === "AbortError") {
        setState("idle");
      } else {
        console.error(err);
        setErrorMsg(err.message || "Network error occurred");
        setState("error");
      }
    }
  };

  const stopTest = () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    setState("idle");
  };

  const getSpeedColor = (mbps: number) => {
    if (mbps < 5) return "text-red-500";
    if (mbps < 20) return "text-orange-500";
    if (mbps < 50) return "text-yellow-500";
    if (mbps < 100) return "text-emerald-500";
    return "text-blue-500"; // Fast
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500/10 text-sky-500 rounded-lg">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Internet Speed Test
            </h1>
            <p className="text-xs text-muted-foreground">
              Estimate your download speed and latency directly from the
              browser.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[400px]">
        {/* Main Display */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-lg">
          {/* Progress Ring Background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div
              className={`w-64 h-64 md:w-80 md:h-80 rounded-full border-[20px] border-current transition-all duration-500 ${state === "downloading" ? "scale-100" : "scale-90 opacity-0"}`}
            />
          </div>

          <div className="z-10 text-center space-y-2">
            <div className="h-8 text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
              {state === "idle" && <span>Ready to test</span>}
              {state === "pinging" && (
                <span className="animate-pulse">Measuring Latency...</span>
              )}
              {state === "downloading" && (
                <span className="animate-pulse">
                  Downloading... {Math.round(progress)}%
                </span>
              )}
              {state === "finished" && (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckIcon className="w-4 h-4" /> Test Complete
                </span>
              )}
              {state === "error" && (
                <span className="text-destructive flex items-center gap-1">
                  <WifiOff className="w-4 h-4" /> Error
                </span>
              )}
            </div>

            {state === "error" ? (
              <div className="py-10">
                <p className="text-xl text-destructive font-semibold">
                  {errorMsg}
                </p>
                <Button onClick={runTest} className="mt-6">
                  Retry
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div
                  className={`text-7xl md:text-9xl font-bold tracking-tighter tabular-nums transition-colors duration-300 ${getSpeedColor(speed)}`}
                >
                  {speed.toFixed(1)}
                </div>
                <div className="text-base md:text-lg text-muted-foreground font-medium mt-[-5px] md:mt-[-10px]">
                  Mbps
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-12 md:mt-16 z-20">
            {(state === "idle" || state === "finished") && (
              <button
                onClick={runTest}
                className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-full group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
              >
                <span className="relative px-8 py-3 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full group-hover:bg-opacity-0 text-lg">
                  {state === "finished" ? (
                    <RefreshCw className="inline-block mr-2 h-5 w-5" />
                  ) : (
                    <Zap className="inline-block mr-2 h-5 w-5" />
                  )}
                  {state === "finished" ? "Test Again" : "Start Test"}
                </span>
              </button>
            )}
            {(state === "downloading" || state === "pinging") && (
              <Button
                variant="outline"
                onClick={stopTest}
                className="rounded-full px-8 border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                Stop
              </Button>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        {(state === "finished" || state === "downloading") && (
          <div className="grid grid-cols-2 gap-4 md:gap-8 mt-12 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-500">
            <Card className="p-4 flex flex-col items-center justify-center gap-1 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Latency
              </div>
              <div className="text-2xl font-bold text-foreground">
                {latency > 0 ? `${latency} ms` : "-"}
              </div>
            </Card>
            <Card className="p-4 flex flex-col items-center justify-center gap-1 border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="text-muted-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDown className="h-3.5 w-3.5" /> Download
              </div>
              <div className="text-2xl font-bold text-foreground">
                {speed.toFixed(1)} Mbps
              </div>
            </Card>
          </div>
        )}

        {/* Note */}
        <div className="mt-auto pt-8 text-center max-w-md mx-auto">
          <p className="text-[10px] text-muted-foreground">
            * This test estimates download speed by fetching a public asset from
            Wikimedia Commons. Results depend on your connection to their CDN
            and browser performance. Upload speed is not tested as this is a
            client-side only tool.
          </p>
        </div>
      </div>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
