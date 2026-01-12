"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import { FileCode, Play, Eraser, Copy, Check } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
// @ts-ignore
import prettier from "prettier";
// @ts-ignore
import parserBabel from "prettier/plugins/babel";
// @ts-ignore
import parserHtml from "prettier/plugins/html";
// @ts-ignore
import parserPostcss from "prettier/plugins/postcss";
// @ts-ignore
import parserMarkdown from "prettier/plugins/markdown";
// @ts-ignore
import parserYaml from "prettier/plugins/yaml";
// @ts-ignore
import parserEstree from "prettier/plugins/estree";
// @ts-ignore
import parserGraphql from "prettier/plugins/graphql";

type Language =
  | "javascript"
  | "typescript"
  | "json"
  | "css"
  | "scss"
  | "html"
  | "markdown"
  | "yaml"
  | "graphql";

export const CodeFormatterTool: React.FC = () => {
  const [input, setInput] = useLocalStorage<string>(
    "devutils-code-format-input",
    ""
  );
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useLocalStorage<Language>(
    "devutils-code-format-lang",
    "javascript"
  );
  const [tabWidth, setTabWidth] = useLocalStorage<number>(
    "devutils-code-format-tab",
    2
  );
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getParser = (lang: Language) => {
    switch (lang) {
      case "javascript":
        return "babel";
      case "typescript":
        return "babel-ts";
      case "json":
        return "json";
      case "css":
        return "css";
      case "scss":
        return "scss";
      case "html":
        return "html";
      case "markdown":
        return "markdown";
      case "yaml":
        return "yaml";
      case "graphql":
        return "graphql";
      default:
        return "babel";
    }
  };

  const getPlugins = (lang: Language) => {
    const basePlugins = [parserEstree];
    switch (lang) {
      case "javascript":
      case "typescript":
      case "json":
        return [...basePlugins, parserBabel];
      case "css":
      case "scss":
        return [...basePlugins, parserPostcss];
      case "html":
        return [...basePlugins, parserHtml, parserBabel, parserPostcss];
      case "markdown":
        return [...basePlugins, parserMarkdown, parserBabel, parserHtml];
      case "yaml":
        return [...basePlugins, parserYaml];
      case "graphql":
        return [...basePlugins, parserGraphql];
      default:
        return [...basePlugins, parserBabel];
    }
  };

  const handleFormat = async () => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setError(null);

    try {
      const formatted = await prettier.format(input, {
        parser: getParser(language),
        plugins: getPlugins(language),
        tabWidth: tabWidth,
        printWidth: 80,
        useTabs: false,
        semi: true,
        singleQuote: false,
      });
      setOutput(formatted);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Formatting failed. Check syntax.");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlaceholder = () => {
    switch (language) {
      case "javascript":
        return "const x={a:1,b:2};function test(n){return n*2}";
      case "css":
        return "body{color:red;margin:0}";
      case "html":
        return "<div><p>Hello</p></div>";
      case "json":
        return '{"a":1,"b":2}';
      default:
        return "Paste code here...";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Code Formatter
            </h1>
            <p className="text-xs text-muted-foreground">
              Prettify code. Supports JS, TS, HTML, CSS, Markdown, etc.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-medium"
          >
            <optgroup label="Web">
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="scss">SCSS</option>
            </optgroup>
            <optgroup label="Data">
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="graphql">GraphQL</option>
              <option value="markdown">Markdown</option>
            </optgroup>
          </select>

          <select
            value={tabWidth}
            onChange={(e) => setTabWidth(Number(e.target.value))}
            className="h-9 w-20 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            title="Indentation Size"
          >
            <option value={2}>2 sp</option>
            <option value={4}>4 sp</option>
            <option value={8}>8 sp</option>
          </select>

          <div className="w-px h-6 bg-border mx-1" />

          <Button onClick={handleFormat} size="sm" className="min-w-[100px]">
            <Play className="mr-2 h-4 w-4" /> Format
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setInput("");
              setOutput("");
              setError(null);
            }}
            variant="destructive"
            size="sm"
            title="Clear All"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card">
          <MonacoEditor
            label={`${language.toUpperCase()} Input`}
            value={input}
            onChange={setInput}
            language={language}
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card relative overflow-hidden">
          <MonacoEditor
            label="Formatted Output"
            value={output}
            readOnly
            lineHighlight="none"
            lineNumbers="off"
            language={language}
            className="border-none"
            actions={
              <Button
                onClick={copyToClipboard}
                variant="ghost"
                size="sm"
                disabled={!output}
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
          {error && (
            <div className="absolute bottom-0 inset-x-0 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-2 px-4 text-xs border-t border-red-200 dark:border-red-800 z-10">
              <strong>Error:</strong> {error}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
