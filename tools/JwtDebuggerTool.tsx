"use client";

import React, { useState, useEffect } from "react";
import { Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import { Key, ShieldCheck, AlertCircle } from "lucide-react";

export const JwtDebuggerTool: React.FC = () => {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState<string | null>(null);

  const decodePart = (part: string) => {
    try {
      let base64 = part.replace(/-/g, "+").replace(/_/g, "/");
      const pad = base64.length % 4;
      if (pad) base64 += "=".repeat(4 - pad);

      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );
      return JSON.stringify(JSON.parse(jsonPayload), null, 2);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!token.trim()) {
      setHeader("");
      setPayload("");
      setSignature("");
      setError(null);
      return;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      setError("Invalid JWT format (must have 3 parts separated by dots).");
      setHeader("");
      setPayload("");
      setSignature("");
      return;
    }

    const decodedHeader = decodePart(parts[0]);
    const decodedPayload = decodePart(parts[1]);

    if (!decodedHeader || !decodedPayload) {
      setError("Failed to decode Base64Url content.");
      return;
    }

    setHeader(decodedHeader);
    setPayload(decodedPayload);
    setSignature(parts[2]);
    setError(null);
  }, [token]);

  const loadExample = () => {
    // Example JWT
    setToken(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    );
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              JWT Debugger
            </h1>
            <p className="text-xs text-muted-foreground">
              Decode and inspect JSON Web Tokens.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        {/* Left: Input */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Key className="h-4 w-4" /> Encoded Token
            </div>
            <button
              onClick={loadExample}
              className="text-xs text-primary hover:underline"
            >
              Load Example
            </button>
          </div>
          <Card className="flex-1 p-0 border-border/60 shadow-sm bg-card relative overflow-hidden flex flex-col">
            <textarea
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full h-full p-6 bg-transparent font-mono text-sm resize-none focus:outline-none text-foreground break-all leading-relaxed"
              placeholder="Paste JWT here (eyJ...)"
              spellCheck={false}
            />
            {error && (
              <div className="absolute bottom-0 inset-x-0 p-3 bg-destructive/10 text-destructive text-sm font-medium border-t border-destructive/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Decoded */}
        <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
          {/* Header Section */}
          <div className="flex flex-col gap-2 flex-1 min-h-[150px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-rose-500 uppercase tracking-wider">
                Header
              </div>
              <span className="text-[10px] text-muted-foreground">
                Algorithm & Token Type
              </span>
            </div>
            <Card className="flex-1 p-0 border-rose-200 dark:border-rose-900/30 shadow-sm bg-card overflow-hidden">
              <MonacoEditor
                value={header}
                language="json"
                readOnly
                lineNumbers="off"
                className="border-none"
              />
            </Card>
          </div>

          {/* Payload Section */}
          <div className="flex flex-col gap-2 flex-[2] min-h-[250px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-500 uppercase tracking-wider">
                Payload
              </div>
              <span className="text-[10px] text-muted-foreground">
                Data Claims
              </span>
            </div>
            <Card className="flex-1 p-0 border-violet-200 dark:border-violet-900/30 shadow-sm bg-card overflow-hidden">
              <MonacoEditor
                value={payload}
                language="json"
                readOnly
                lineNumbers="off"
                className="border-none"
              />
            </Card>
          </div>

          {/* Signature Section */}
          <div className="flex flex-col gap-2 flex-none">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-500 uppercase tracking-wider">
                Signature
              </div>
            </div>
            <Card className="p-4 border-cyan-200 dark:border-cyan-900/30 bg-muted/10 font-mono text-xs break-all text-muted-foreground min-h-[3rem]">
              {signature ? (
                <span className="text-cyan-600 dark:text-cyan-400">
                  {signature}
                </span>
              ) : (
                <span className="opacity-50 italic">Waiting for input...</span>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
