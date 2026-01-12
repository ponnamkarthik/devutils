import React, { useCallback, useEffect, useState } from "react";
// @ts-ignore
import Editor, { DiffEditor } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MonacoEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  lineNumbers?: "on" | "off";
  lineHighlight?: "all" | "line" | "none" | "gutter";
  label?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = "json",
  readOnly = false,
  lineNumbers = "on",
  lineHighlight = "all",
  label,
  actions,
  className,
}) => {
  const [editorTheme, setEditorTheme] = useState("devutils-light");

  const handleEditorWillMount = useCallback((monaco: any) => {
    monaco.editor.defineTheme("devutils-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0f172a", // Slate 900 (Matches bg-card)
        "editor.foreground": "#e2e8f0", // Slate 200
        "editor.lineHighlightBackground": "#1e293b", // Slate 800
        "editorLineNumber.foreground": "#475569", // Slate 600
        "editorGutter.background": "#0f172a", // Slate 900
        "scrollbarSlider.background": "#33415550",
        "scrollbarSlider.hoverBackground": "#33415580",
        "scrollbarSlider.activeBackground": "#334155",
      },
    });
    monaco.editor.defineTheme("devutils-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff", // White
        "editor.foreground": "#0f172a", // Slate 900
        "editor.lineHighlightBackground": "#f1f5f9", // Slate 100
        "editorLineNumber.foreground": "#94a3b8", // Slate 400
        "editorGutter.background": "#ffffff",
      },
    });
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setEditorTheme(isDark ? "devutils-dark" : "devutils-light");
    };

    syncTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") syncTheme();
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("flex flex-col h-full w-full overflow-hidden", className)}
    >
      {(label || actions) && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
          <div className="flex items-center gap-2 text-muted-foreground">
            {label && (
              <span className="text-xs font-semibold uppercase tracking-wider">
                {label}
              </span>
            )}
            {readOnly && label && (
              <span className="text-[10px] uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                Read-only
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 relative min-h-0 bg-card">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={value}
          theme={editorTheme}
          onChange={(val: string) => onChange?.(val || "")}
          beforeMount={handleEditorWillMount}
          loading={
            <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading Editor...</span>
            </div>
          }
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: lineNumbers,
            renderLineHighlight: lineHighlight,
            roundedSelection: false,
            scrollBeyondLastLine: false,
            readOnly: readOnly,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
            wordWrap: "on",
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </div>
    </div>
  );
};

interface MonacoDiffEditorProps {
  original: string;
  modified: string;
  language?: string;
  className?: string;
}

export const MonacoDiffEditor: React.FC<MonacoDiffEditorProps> = ({
  original,
  modified,
  language = "plaintext",
  className,
}) => {
  const [editorTheme, setEditorTheme] = useState("devutils-light");

  // Duplicate theme logic to ensure diff editor also gets custom themes
  // Note: Since defineTheme is global to monaco instance, if standard Editor mounts first, this is redundant but safe.
  const handleEditorWillMount = useCallback((monaco: any) => {
    monaco.editor.defineTheme("devutils-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#0f172a",
        "editor.foreground": "#e2e8f0",
        "editor.lineHighlightBackground": "#1e293b",
        "editorLineNumber.foreground": "#475569",
        "editorGutter.background": "#0f172a",
        "scrollbarSlider.background": "#33415550",
        "scrollbarSlider.hoverBackground": "#33415580",
        "scrollbarSlider.activeBackground": "#334155",
        "diffEditor.insertedTextBackground": "#22c55e20",
        "diffEditor.removedTextBackground": "#ef444420",
      },
    });
    monaco.editor.defineTheme("devutils-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#0f172a",
        "editor.lineHighlightBackground": "#f1f5f9",
        "editorLineNumber.foreground": "#94a3b8",
        "editorGutter.background": "#ffffff",
        "diffEditor.insertedTextBackground": "#22c55e20",
        "diffEditor.removedTextBackground": "#ef444420",
      },
    });
  }, []);

  useEffect(() => {
    const syncTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setEditorTheme(isDark ? "devutils-dark" : "devutils-light");
    };
    syncTheme();
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") syncTheme();
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("flex flex-col h-full w-full overflow-hidden", className)}
    >
      <div className="flex-1 relative min-h-0 bg-card">
        <DiffEditor
          height="100%"
          language={language}
          original={original}
          modified={modified}
          theme={editorTheme}
          beforeMount={handleEditorWillMount}
          loading={
            <div className="flex items-center justify-center h-full text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading Diff...</span>
            </div>
          }
          options={{
            renderSideBySide: true,
            readOnly: true, // Diff view is typically read-only
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            fontSize: 13,
            padding: { top: 10, bottom: 10 },
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        />
      </div>
    </div>
  );
};
