"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Book,
  Upload,
  Download,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  Box,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import yaml from "js-yaml";

// --- Types & Interfaces for Internal Normalized Doc Structure ---

interface DocCollection {
  title: string;
  description: string;
  version: string;
  groups: DocGroup[];
}

interface DocGroup {
  id: string;
  name: string;
  description?: string;
  items: (DocEndpoint | DocGroup)[]; // Can contain endpoints or sub-folders
}

interface DocEndpoint {
  id: string;
  name: string; // e.g. "Get User"
  method: string; // GET, POST
  path: string; // /users/:id
  summary?: string;
  description?: string;
  params?: DocParam[];
  body?: any; // JSON object or string
  responses?: DocResponse[];
}

interface DocParam {
  name: string;
  in: "query" | "path" | "header" | "body";
  description?: string;
  required?: boolean;
  type?: string;
  example?: string;
}

interface DocResponse {
  code: string | number;
  status?: string;
  body?: any;
}

// --- CSS for Exported HTML ---
const EXPORT_CSS = `
:root {
  --bg-color: #ffffff;
  --text-color: #1a202c;
  --sidebar-bg: #f7fafc;
  --border-color: #e2e8f0;
  --accent: #3182ce;
  --code-bg: #2d3748;
  --code-text: #e2e8f0;
  --method-get: #48bb78;
  --method-post: #ecc94b;
  --method-put: #4299e1;
  --method-delete: #f56565;
  --method-patch: #9f7aea;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg-color: #1a202c;
    --text-color: #edf2f7;
    --sidebar-bg: #2d3748;
    --border-color: #4a5568;
    --accent: #63b3ed;
    --code-bg: #171923;
  }
}
body { font-family: -apple-system, system-ui, sans-serif; margin: 0; display: flex; height: 100vh; background: var(--bg-color); color: var(--text-color); overflow: hidden; }
.sidebar { width: 300px; background: var(--sidebar-bg); border-right: 1px solid var(--border-color); overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; flex-shrink: 0; }
.main { flex: 1; overflow-y: auto; padding: 2rem; scroll-behavior: smooth; }
.brand { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: var(--accent); }
.group-title { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: var(--text-color); opacity: 0.6; }
.nav-item { display: block; padding: 0.5rem; text-decoration: none; color: var(--text-color); border-radius: 4px; margin-bottom: 2px; font-size: 0.9rem; }
.nav-item:hover { background: rgba(0,0,0,0.05); }
.nav-item.active { background: var(--accent); color: white; }
.endpoint { margin-bottom: 4rem; border-bottom: 1px solid var(--border-color); padding-bottom: 2rem; }
.endpoint-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.method { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 0.8rem; color: white; text-transform: uppercase; }
.method.GET { background: var(--method-get); }
.method.POST { background: var(--method-post); color: #000; }
.method.PUT { background: var(--method-put); }
.method.DELETE { background: var(--method-delete); }
.method.PATCH { background: var(--method-patch); }
.path { font-family: monospace; font-size: 1.1rem; font-weight: 600; }
.desc { margin-bottom: 1.5rem; line-height: 1.6; opacity: 0.9; }
h3 { font-size: 1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1rem; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid var(--border-color); }
th { font-weight: 600; opacity: 0.8; }
code { background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace; }
pre { background: var(--code-bg); color: var(--code-text); padding: 1rem; border-radius: 6px; overflow-x: auto; font-size: 0.85rem; }
.folder { margin-left: 10px; border-left: 1px solid var(--border-color); padding-left: 10px; }
.folder-label { font-weight: 600; margin: 5px 0; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 5px; }
`;

const EXPORT_SCRIPT = `
document.addEventListener('DOMContentLoaded', () => {
  // Simple sidebar highlight
  const links = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.endpoint');
  
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      if (scrollY >= sectionTop - 100) {
        current = section.getAttribute('id');
      }
    });
    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });
  
  // Folder toggles
  document.querySelectorAll('.folder-label').forEach(label => {
    label.addEventListener('click', () => {
        const content = label.nextElementSibling;
        if(content) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? 'block' : 'none';
            label.querySelector('.arrow').style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
        }
    });
  });
});
`;

// --- Parsers ---

const inferParamTypeFromExample = (example: unknown): string | undefined => {
  if (example === null || example === undefined) return undefined;
  if (typeof example === "boolean") return "boolean";
  if (typeof example === "number") return "number";
  if (typeof example !== "string") return typeof example;

  const s = example.trim();
  if (!s) return undefined;
  if (/^(true|false)$/i.test(s)) return "boolean";
  if (/^-?\d+(\.\d+)?$/.test(s)) return "number";
  return "string";
};

const parsePostman = (json: any): DocCollection => {
  const info = json.info || {};

  const parseItems = (items: any[]): (DocEndpoint | DocGroup)[] => {
    return items.map((item) => {
      if (item.item) {
        // It's a folder
        return {
          id: item.id || String(Math.random()),
          name: item.name,
          description: item.description,
          items: parseItems(item.item),
        } as DocGroup;
      } else {
        // It's a request
        const req = item.request || {};
        const urlObj = req.url || {};
        let path = "";

        if (typeof urlObj === "string") {
          path = urlObj;
        } else if (urlObj.raw) {
          path = urlObj.raw;
        } else if (Array.isArray(urlObj.path)) {
          path = "/" + urlObj.path.join("/");
        }

        // Extract query params
        const params: DocParam[] = [];
        if (urlObj.query) {
          urlObj.query.forEach((q: any) =>
            params.push({
              name: q.key,
              in: "query",
              description: q.description,
              example: q.value,
              type: inferParamTypeFromExample(q.value),
            })
          );
        }
        if (req.header) {
          req.header.forEach((h: any) =>
            params.push({
              name: h.key,
              in: "header",
              description: h.description,
              example: h.value,
              type: inferParamTypeFromExample(h.value),
            })
          );
        }

        // Extract Body
        let body = null;
        if (req.body && req.body.mode === "raw") {
          try {
            body = JSON.parse(req.body.raw);
          } catch {
            body = req.body.raw;
          }
        }

        // Responses
        const responses = (item.response || []).map((res: any) => {
          let resBody = null;
          try {
            resBody = JSON.parse(res.body);
          } catch {
            resBody = res.body;
          }
          return {
            code: res.code,
            status: res.status,
            body: resBody,
          };
        });

        return {
          id: item.id || String(Math.random()),
          name: item.name,
          method: req.method || "GET",
          path: path,
          description: item.request.description,
          params,
          body,
          responses,
        } as DocEndpoint;
      }
    });
  };

  return {
    title: info.name || "API Documentation",
    description: info.description || "",
    version: "v2.1", // Postman exports usually v2.1
    groups: [
      {
        id: "root",
        name: "Endpoints",
        items: parseItems(json.item || []),
      },
    ],
  };
};

const parseOpenApi = (json: any): DocCollection => {
  const info = json.info || {};
  const paths = json.paths || {};
  const groups: Record<string, DocEndpoint[]> = { General: [] };

  Object.entries(paths).forEach(([path, methods]: [string, any]) => {
    Object.entries(methods).forEach(([method, details]: [string, any]) => {
      if (method === "parameters" || method === "summary") return; // Skip path-level params for simplicity

      const endpoint: DocEndpoint = {
        id: String(Math.random()),
        name: details.summary || details.operationId || path,
        method: method.toUpperCase(),
        path: path,
        description: details.description,
        params: [],
        responses: [],
      };

      // Parameters
      if (details.parameters) {
        details.parameters.forEach((p: any) => {
          endpoint.params?.push({
            name: p.name,
            in: p.in,
            required: p.required,
            description: p.description,
            type: p.schema?.type,
          });
        });
      }

      // Body
      if (details.requestBody) {
        const content = details.requestBody.content;
        const jsonContent = content?.["application/json"];
        if (jsonContent && jsonContent.schema) {
          endpoint.body = jsonContent.schema; // Just showing schema structure
        }
      }

      // Responses
      if (details.responses) {
        Object.entries(details.responses).forEach(
          ([code, res]: [string, any]) => {
            endpoint.responses?.push({
              code: code,
              status: res.description,
              // Simplification: not parsing full schema for response
            });
          }
        );
      }

      // Grouping
      const tag =
        details.tags && details.tags.length > 0 ? details.tags[0] : "General";
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(endpoint);
    });
  });

  // Convert groups map to array
  const docGroups: DocGroup[] = Object.entries(groups).map(([name, items]) => ({
    id: name,
    name,
    items,
  }));

  return {
    title: info.title || "API Documentation",
    description: info.description || "",
    version: info.version || "1.0.0",
    groups: docGroups,
  };
};

// --- Main Component ---

export const ApiDocsTool: React.FC = () => {
  const [input, setInput] = useLocalStorage<string>("api-docs-input", "");
  const [doc, setDoc] = useState<DocCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    document.title = "API Documentation Generator - DevUtils";
  }, []);

  const handleParse = () => {
    setError(null);
    if (!input.trim()) return;

    try {
      // Attempt JSON parse first
      let jsonObj;
      try {
        jsonObj = JSON.parse(input);
      } catch {
        // Try YAML
        try {
          jsonObj = yaml.load(input);
        } catch (e) {
          throw new Error("Invalid JSON or YAML format.");
        }
      }

      if (jsonObj.info && jsonObj.item) {
        // Looks like Postman
        setDoc(parsePostman(jsonObj));
      } else if (jsonObj.openapi || jsonObj.swagger) {
        // Looks like OpenAPI
        setDoc(parseOpenApi(jsonObj));
      } else {
        throw new Error(
          "Unrecognized format. Please provide a valid Postman Collection (v2.1) or OpenAPI (v3) file."
        );
      }
    } catch (e: any) {
      setError(e.message);
      setDoc(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setInput(evt.target.result as string);
        // Auto parse after upload
        setTimeout(() => {
          // Trigger parse manually since state update is async, or we can just call logic here
          // But to reuse logic, we rely on user clicking "Generate" or use useEffect.
          // Let's rely on user click to "Generate" or do it inside useEffect if we wanted auto-preview.
          // For better UX, let's keep input in editor and let user click Generate.
        }, 100);
      }
    };
    reader.readAsText(file);
  };

  const generateHtml = () => {
    if (!doc) return "";

    // Recursively build sidebar HTML
    const buildSidebar = (groups: DocGroup[]): string => {
      return groups
        .map((g) => {
          let html = `<div class="folder">`;
          // If it's a root group with items
          if (g.name !== "Endpoints" && g.name !== "General") {
            html += `<div class="folder-label"><span class="arrow" style="display:inline-block; transition: 0.2s;">▶</span> ${g.name}</div><div style="display:none">`;
          } else {
            // Root level items, show directly
            html += `<div>`;
          }

          g.items.forEach((item) => {
            if ("items" in item) {
              // It's a sub-group
              html += buildSidebar([item]);
            } else {
              // Endpoint
              html += `<a href="#${item.id}" class="nav-item">
                        <span class="method ${item.method}" style="font-size:0.6rem; padding: 1px 4px; margin-right: 4px;">${item.method}</span>
                        ${item.name}
                      </a>`;
            }
          });

          html += `</div></div>`;
          return html;
        })
        .join("");
    };

    // Recursively build content HTML
    const buildContent = (groups: DocGroup[]): string => {
      return groups
        .map((g) => {
          let html = "";
          if (g.name !== "Endpoints" && g.name !== "General") {
            html += `<h2 class="group-title">${g.name}</h2>`;
            if (g.description) html += `<p>${g.description}</p>`;
          }

          g.items.forEach((item) => {
            if ("items" in item) {
              html += buildContent([item]);
            } else {
              const ep = item as DocEndpoint;
              html += `
                        <div id="${ep.id}" class="endpoint">
                            <div class="endpoint-header">
                                <span class="method ${ep.method}">${ep.method}</span>
                                <span class="path">${ep.path}</span>
                            </div>
                            <h3>${ep.name}</h3>
                            ${ep.description ? `<p class="desc">${ep.description}</p>` : ""}
                            
                            ${
                              ep.params && ep.params.length > 0
                                ? `
                                <h4>Parameters</h4>
                                <table>
                                    <thead><tr><th>Name</th><th>In</th><th>Required</th><th>Type</th><th>Description</th></tr></thead>
                                    <tbody>
                                        ${ep.params
                                          .map(
                                            (p) => `
                                            <tr>
                                                <td><code>${p.name}</code></td>
                                                <td>${p.in}</td>
                                                <td>${p.required ? "Yes" : "No"}</td>
                                                <td>${p.type || "-"}</td>
                                                <td>${p.description || "-"}</td>
                                            </tr>
                                        `
                                          )
                                          .join("")}
                                    </tbody>
                                </table>
                            `
                                : ""
                            }

                            ${
                              ep.body
                                ? `
                                <h4>Request Body</h4>
                                <pre>${JSON.stringify(ep.body, null, 2)}</pre>
                            `
                                : ""
                            }

                            ${
                              ep.responses && ep.responses.length > 0
                                ? `
                                <h4>Responses</h4>
                                ${ep.responses
                                  .map(
                                    (r) => `
                                    <div style="margin-bottom: 1rem;">
                                        <strong>${r.code}</strong> ${r.status || ""}
                                        ${r.body ? `<pre>${JSON.stringify(r.body, null, 2)}</pre>` : ""}
                                    </div>
                                `
                                  )
                                  .join("")}
                            `
                                : ""
                            }
                        </div>
                      `;
            }
          });
          return html;
        })
        .join("");
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.title}</title>
    <style>${EXPORT_CSS}</style>
</head>
<body>
    <div class="sidebar">
        <div class="brand">${doc.title}</div>
        ${buildSidebar(doc.groups)}
    </div>
    <div class="main">
        <h1>${doc.title}</h1>
        <p>${doc.description}</p>
        <hr style="border: 0; border-bottom: 1px solid var(--border-color); margin: 2rem 0;">
        ${buildContent(doc.groups)}
    </div>
    <script>${EXPORT_SCRIPT}</script>
</body>
</html>`;
  };

  const handleDownload = () => {
    const html = generateHtml();
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(doc?.title || "api-docs").replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Render Helpers for Preview ---

  // Reuse the logic for generating Sidebar/Content but render React components instead of strings
  const PreviewSidebarItem = ({ item }: { item: DocGroup | DocEndpoint }) => {
    const [isOpen, setIsOpen] = useState(false);

    if ("items" in item) {
      // Folder
      return (
        <div className="ml-2 pl-2 border-l border-border/40">
          <div
            className="flex items-center gap-1 py-1 text-sm font-medium cursor-pointer hover:text-primary transition-colors select-none"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            {item.name}
          </div>
          {isOpen && (
            <div className="flex flex-col">
              {item.items.map((child, i) => (
                <PreviewSidebarItem key={i} item={child} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Endpoint
    const methodColor =
      {
        GET: "bg-emerald-500",
        POST: "bg-yellow-500 text-black",
        PUT: "bg-blue-500",
        DELETE: "bg-red-500",
        PATCH: "bg-purple-500",
      }[item.method] || "bg-gray-500";

    return (
      <a
        href={`#${item.id}`}
        className="block py-1 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors truncate"
      >
        <span
          className={`inline-block px-1 rounded mr-2 font-bold text-[10px] text-white ${methodColor} min-w-[35px] text-center`}
        >
          {item.method}
        </span>
        {item.name}
      </a>
    );
  };

  const PreviewContentItem = ({ item }: { item: DocGroup | DocEndpoint }) => {
    if ("items" in item) {
      return (
        <div className="mb-8">
          <h2 className="text-lg font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 pb-2 mb-4">
            {item.name}
          </h2>
          {item.items.map((child, i) => (
            <PreviewContentItem key={i} item={child} />
          ))}
        </div>
      );
    }

    const methodColor =
      {
        GET: "bg-emerald-500",
        POST: "bg-yellow-500 text-black",
        PUT: "bg-blue-500",
        DELETE: "bg-red-500",
        PATCH: "bg-purple-500",
      }[item.method] || "bg-gray-500";

    return (
      <div id={item.id} className="mb-12 scroll-mt-4">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`px-2 py-1 rounded text-sm font-bold text-white ${methodColor}`}
          >
            {item.method}
          </span>
          <code className="text-lg font-mono font-semibold">{item.path}</code>
        </div>
        <h3 className="text-xl font-bold mb-2">{item.name}</h3>
        {item.description && (
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            {item.description}
          </p>
        )}

        {item.params && item.params.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">
              Parameters
            </h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/30 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-2 border-b border-border">Name</th>
                    <th className="p-2 border-b border-border">In</th>
                    <th className="p-2 border-b border-border">Required</th>
                    <th className="p-2 border-b border-border">Type</th>
                    <th className="p-2 border-b border-border">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {item.params.map((p, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono text-xs">{p.name}</td>
                      <td className="p-2">{p.in}</td>
                      <td className="p-2">{p.required ? "Yes" : "No"}</td>
                      <td className="p-2 font-mono text-xs">{p.type || "-"}</td>
                      <td className="p-2 text-muted-foreground">
                        {p.description || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {item.body && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold uppercase text-muted-foreground mb-2">
              Request Body
            </h4>
            <div className="bg-muted/10 border border-border rounded-lg p-3 overflow-x-auto">
              <pre className="text-xs font-mono">
                {JSON.stringify(item.body, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <Book className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              API Docs Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Convert Postman Collections or OpenAPI specs to HTML
              documentation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Input */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            <div className="p-3 border-b border-border/20 bg-muted/20 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Input Source
                </span>
                <div className="relative">
                  <input
                    type="file"
                    id="api-file"
                    className="hidden"
                    accept=".json,.yaml,.yml"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("api-file")?.click()}
                    className="h-6 text-xs gap-1"
                  >
                    <Upload className="h-3 w-3" /> {fileName || "Load File"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 relative min-h-[200px]">
              <MonacoEditor
                value={input}
                onChange={setInput}
                language="json"
                className="border-none"
                placeholder="Paste Postman Collection (v2.1) JSON or OpenAPI (v3) YAML/JSON here — or click ‘Load File’ to upload."
              />
            </div>
            <div className="p-3 border-t border-border/20 bg-muted/20 flex justify-between items-center">
              <Button onClick={handleParse} size="sm" className="w-full">
                Generate Documentation
              </Button>
            </div>
          </Card>

          {error && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-8 flex flex-col gap-4 h-full min-h-0 relative">
          <Card className="flex-1 flex flex-col p-0 border-border/60 shadow-sm bg-card overflow-hidden">
            {doc ? (
              <div className="flex flex-1 h-full">
                {/* Preview Sidebar */}
                <div className="w-64 border-r border-border/40 bg-muted/5 overflow-y-auto p-4 hidden md:block">
                  <div className="font-bold text-lg mb-4 text-primary">
                    {doc.title}
                  </div>
                  <div className="flex flex-col gap-1">
                    {doc.groups.map((group, i) => (
                      <PreviewSidebarItem key={i} item={group} />
                    ))}
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-background relative">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{doc.title}</h1>
                        <p className="text-muted-foreground">
                          {doc.description}
                        </p>
                      </div>
                      <Button
                        onClick={handleDownload}
                        className="gap-2 shrink-0"
                      >
                        <Download className="h-4 w-4" /> Export HTML
                      </Button>
                    </div>

                    <hr className="border-border/40 mb-8" />

                    {doc.groups.map((group, i) => (
                      <PreviewContentItem key={i} item={group} />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                <Box className="h-16 w-16 mb-4 opacity-20" />
                <h3 className="text-lg font-semibold mb-2">
                  Ready to Generate
                </h3>
                <p className="text-sm max-w-md">
                  Paste your Postman Collection (v2.1) or OpenAPI (v3) spec on
                  the left and click "Generate" to preview and export your
                  documentation.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
