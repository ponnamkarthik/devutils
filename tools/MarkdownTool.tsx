"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  FileText,
  Download,
  Printer,
  Play,
  Eraser,
  FileCode,
} from "lucide-react";
// @ts-ignore
import { marked } from "marked";
import { useLocalStorage } from "../hooks/useLocalStorage";

// Configure marked globally with typographic replacements
marked.use({
  gfm: true,
  breaks: true,
  walkTokens: (token: any) => {
    // Only replace in text tokens, preserving code blocks and codespans
    if (token.type === "text") {
      token.text = token.text
        .replace(/\(c\)/gi, "©")
        .replace(/\(r\)/gi, "®")
        .replace(/\(tm\)/gi, "™")
        .replace(/\+-/g, "±");
    }
  },
});

export const MarkdownTool: React.FC = () => {
  const [markdown, setMarkdown] = useLocalStorage<string>(
    "devutils-markdown-input",
    ""
  );
  const [html, setHtml] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const parseMarkdown = async () => {
      try {
        if (!markdown.trim()) {
          setHtml("");
          return;
        }
        // Parse Markdown (asynchronous in v12+)
        const parsed = await marked.parse(markdown);
        setHtml(parsed);
        setError(null);
      } catch (e: any) {
        setError("Failed to parse Markdown: " + e.message);
      }
    };

    // Debounce slightly to avoid rapid re-parsing
    const timer = setTimeout(parseMarkdown, 50);
    return () => clearTimeout(timer);
  }, [markdown]);

  const loadExample = () => {
    const example = `# Markdown Guide

## Headers
# H1
## H2
### H3

## Typography
(c) (C) (r) (R) (tm) (TM) +-

## Emphasis
*Italic* or _Italic_
**Bold** or __Bold__
***Bold Italic***

## Lists
1. First item
2. Second item
   * Sub-item
   * Another sub-item

## Code
Inline \`code\` works well.

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

## Quotes
> This is a blockquote.
> It can span multiple lines.

## Links & Images
[DevUtils](/)
![Image](https://picsum.photos/300/200)

## Tables
| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |
`;
    setMarkdown(example);
  };

  const exportHtml = () => {
    if (!html) return;

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Markdown</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    h1, h2, h3 { color: #111; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
    pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 1em; color: #666; margin-left: 0; }
    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f8f8f8; }
    img { max-width: 100%; }
  </style>
</head>
<body>
${html}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to export as PDF/Print.");
      return;
    }

    // We use a clean template for printing
    printWindow.document.write(`
        <html>
        <head>
            <title>Markdown Export</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
                    line-height: 1.6; 
                    color: #000; 
                    max-width: 100%;
                    padding: 40px;
                }
                h1 { font-size: 2em; border-bottom: 1px solid #ddd; padding-bottom: 0.3em; margin-bottom: 1em; }
                h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1.5em; }
                h3 { font-size: 1.25em; margin-top: 1.5em; }
                p { margin: 1em 0; }
                code { font-family: ui-monospace, SFMono-Regular, Consolas, 'Courier New', monospace; background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-size: 0.9em; }
                pre { background: #f5f5f5; padding: 1em; border-radius: 5px; overflow-x: auto; page-break-inside: avoid; }
                pre code { background: none; padding: 0; }
                blockquote { border-left: 4px solid #ddd; padding-left: 1em; color: #555; margin-left: 0; }
                ul, ol { padding-left: 2em; }
                img { max-width: 100%; height: auto; }
                table { border-collapse: collapse; width: 100%; margin: 1em 0; page-break-inside: avoid; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #eee; font-weight: bold; }
                a { color: #0366d6; text-decoration: none; }
            </style>
        </head>
        <body>
            ${html}
            <script>
                window.onload = () => {
                    setTimeout(() => {
                        window.print();
                        window.close();
                    }, 500); // Allow images to render
                };
            </script>
        </body>
        </html>
      `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Markdown Editor
            </h1>
            <p className="text-xs text-muted-foreground">
              Write Markdown with live preview and export to HTML or PDF.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm flex-none">
        <div className="flex items-center gap-2">
          <Button onClick={loadExample} variant="ghost" size="sm">
            <Play className="mr-2 h-4 w-4" /> Load Example
          </Button>
          <Button
            onClick={() => setMarkdown("")}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
          >
            <Eraser className="mr-2 h-4 w-4" /> Clear
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportHtml}
            variant="secondary"
            size="sm"
            disabled={!html}
          >
            <FileCode className="mr-2 h-4 w-4" /> Export HTML
          </Button>
          <Button onClick={handlePrint} size="sm" disabled={!html}>
            <Printer className="mr-2 h-4 w-4" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Editor */}
        <Card className="flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
          <MonacoEditor
            value={markdown}
            onChange={setMarkdown}
            language="markdown"
            label="Markdown Input"
            className="border-none"
          />
        </Card>

        {/* Preview */}
        <Card className="flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden relative">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Live Preview
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
            {/* Tailwind Typography-like styling using arbitrary groups */}
            <div
              className={`
                        prose dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:text-foreground prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h1:border-b prose-h1:pb-2 prose-h2:mt-6 prose-h2:mb-4
                        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-3
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-code:text-xs prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:font-mono prose-code:text-foreground
                        prose-pre:bg-muted/50 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:border prose-pre:border-border/50
                        prose-ul:list-disc prose-ul:pl-6 prose-ul:my-3
                        prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-3
                        prose-li:text-muted-foreground prose-li:my-1
                        prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground prose-blockquote:my-4
                        prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-sm prose-img:max-w-full
                        prose-table:w-full prose-table:border-collapse prose-table:my-4
                        prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted/30 prose-th:text-left prose-th:text-sm prose-th:font-semibold
                        prose-td:border prose-td:border-border prose-td:p-2 prose-td:text-sm prose-td:text-muted-foreground
                        ${!html ? "hidden" : ""}
                    `}
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {!html && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-2">
                <FileText className="h-12 w-12" />
                <p>Preview will appear here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
