"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node as RFNode,
  MarkerType,
  ProOptions,
  useReactFlow,
  ReactFlowProvider,
  getRectOfNodes,
} from "reactflow";
// @ts-ignore
import dagre from "dagre";
// @ts-ignore
import { toPng, toJpeg, toSvg } from "html-to-image";
import { Button } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import {
  Network,
  Play,
  Braces,
  Layout,
  ListTree,
  Download,
  Image as ImageIcon,
  FileCode,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

// --- Configuration ---
const proOptions: ProOptions = { hideAttribution: true };

// --- Custom Node Component for "Table" look ---
const JsonNode = ({ data }: NodeProps) => {
  return (
    <div className="min-w-[180px] bg-card border border-border rounded-md shadow-sm text-xs font-mono overflow-hidden transition-colors">
      <div className="bg-muted/50 px-3 py-1.5 border-b border-border font-bold text-muted-foreground flex justify-between items-center">
        <span
          className="truncate max-w-[140px] text-foreground"
          title={data.label}
        >
          {data.label}
        </span>
        <span className="opacity-50 text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/50">
          {data.isArray ? "[]" : "{}"}
        </span>
      </div>

      <div className="p-0 bg-card">
        {data.entries.map((entry: any) => (
          <div
            key={entry.key}
            className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 last:border-0 hover:bg-muted/30 relative group transition-colors"
          >
            <span className="text-primary mr-3 font-semibold">{entry.key}</span>

            {entry.isPrimitive ? (
              <span
                className="text-muted-foreground truncate max-w-[120px]"
                title={String(entry.value)}
              >
                {entry.value === null ? "null" : String(entry.value)}
              </span>
            ) : (
              <div className="relative flex items-center">
                <span className="text-muted-foreground italic text-[10px] mr-2 opacity-70">
                  {entry.isArray ? `Array(${entry.count})` : "Object"}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={entry.key}
                  className="!bg-primary !w-2 !h-2 !-right-4 !border-0"
                />
              </div>
            )}
          </div>
        ))}
        {data.entries.length === 0 && (
          <div className="px-3 py-2 text-muted-foreground italic text-[10px]">
            Empty
          </div>
        )}
      </div>

      {data.isRoot ? null : (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-primary !w-2 !h-2 !border-0"
        />
      )}
    </div>
  );
};

const nodeTypes = { jsonNode: JsonNode };

// --- Graph Layout Logic (Dagre) ---
const getLayoutedElements = (nodes: RFNode[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Force Left-to-Right layout
  dagreGraph.setGraph({ rankdir: "LR" });

  nodes.forEach((node) => {
    // Approximate height based on entries
    const height = node.data.entries.length * 28 + 35;
    dagreGraph.setNode(node.id, { width: 220, height: Math.max(height, 50) });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// --- Parser Logic ---
let nodeIdCounter = 0;
const parseJsonToGraph = (data: any, label = "root", isRoot = true) => {
  nodeIdCounter = 0;
  const nodes: RFNode[] = [];
  const edges: Edge[] = [];

  const traverse = (
    current: any,
    currentLabel: string,
    currentId: string,
    isRootNode: boolean
  ) => {
    const isArray = Array.isArray(current);
    const entries: any[] = [];
    const keys = Object.keys(current);

    keys.forEach((key) => {
      const value = current[key];
      const type = typeof value;
      const isPrimitive =
        value === null ||
        type === "string" ||
        type === "number" ||
        type === "boolean";

      if (isPrimitive) {
        entries.push({ key, value, isPrimitive: true });
      } else {
        const childId = `n-${++nodeIdCounter}`;
        const childIsArray = Array.isArray(value);
        const count = childIsArray ? value.length : Object.keys(value).length;

        entries.push({
          key,
          value: childIsArray ? "Array" : "Object",
          isPrimitive: false,
          childId,
          isArray: childIsArray,
          count,
        });

        edges.push({
          id: `e-${currentId}-${childId}`,
          source: currentId,
          target: childId,
          sourceHandle: key,
          animated: true,
          type: "bezier",
          style: { stroke: "hsl(var(--primary))", strokeWidth: 1.5 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "hsl(var(--primary))",
          },
        });

        traverse(value, key, childId, false);
      }
    });

    nodes.push({
      id: currentId,
      type: "jsonNode",
      data: { label: currentLabel, isArray, entries, isRoot: isRootNode },
      position: { x: 0, y: 0 },
    });
  };

  if (typeof data === "object" && data !== null) {
    traverse(data, label, "root", true);
  } else {
    nodes.push({
      id: "root",
      type: "jsonNode",
      data: {
        label: "root",
        isArray: false,
        entries: [{ key: "value", value: String(data), isPrimitive: true }],
        isRoot: true,
      },
      position: { x: 0, y: 0 },
    });
  }

  return { nodes, edges };
};

// --- Tree View Components ---

const JsonTreeItem: React.FC<{
  name?: string;
  value: any;
  isLast: boolean;
  depth?: number;
}> = ({ name, value, isLast, depth = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const isObject = value !== null && typeof value === "object";
  const isArray = Array.isArray(value);
  const isEmpty = isObject && Object.keys(value).length === 0;

  const toggle = () => setExpanded(!expanded);

  // Render Primitive
  if (!isObject) {
    let valColor = "text-green-600 dark:text-green-400"; // String
    if (typeof value === "number")
      valColor = "text-orange-600 dark:text-orange-400";
    if (typeof value === "boolean")
      valColor = "text-blue-600 dark:text-blue-400";
    if (value === null) valColor = "text-gray-500";

    const valDisplay = typeof value === "string" ? `"${value}"` : String(value);

    return (
      <div className="font-mono text-sm leading-6 hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded">
        <span style={{ marginLeft: depth * 20 }} className="mr-1">
          {name && (
            <span className="text-purple-700 dark:text-purple-400 font-semibold">
              "{name}"
            </span>
          )}
          {name && <span className="text-foreground">: </span>}
          <span className={valColor}>{valDisplay}</span>
          {!isLast && <span className="text-foreground">,</span>}
        </span>
      </div>
    );
  }

  // Render Object/Array
  const keys = Object.keys(value);
  const openBracket = isArray ? "[" : "{";
  const closeBracket = isArray ? "]" : "}";

  return (
    <div className="font-mono text-sm leading-6">
      <div
        className="flex items-center hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded cursor-pointer group"
        onClick={toggle}
      >
        <div style={{ paddingLeft: depth * 20 }} className="flex items-center">
          {!isEmpty && (
            <div className="mr-1 text-muted-foreground group-hover:text-foreground">
              {expanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </div>
          )}
          {isEmpty && <span className="w-4 mr-1"></span>}

          {name && (
            <span className="text-purple-700 dark:text-purple-400 font-semibold mr-1">
              "{name}"
            </span>
          )}
          {name && <span className="text-foreground mr-1">: </span>}

          <span className="text-foreground font-bold">{openBracket}</span>
          {!expanded && (
            <span className="text-muted-foreground text-xs mx-1">
              {isArray ? `Array(${keys.length})` : `Object(${keys.length})`}
            </span>
          )}
          {(!expanded || isEmpty) && (
            <span>
              <span className="text-foreground font-bold">{closeBracket}</span>
              {!isLast && <span className="text-foreground">,</span>}
            </span>
          )}
        </div>
      </div>

      {expanded && !isEmpty && (
        <div>
          {keys.map((key, index) => (
            <JsonTreeItem
              key={key}
              name={isArray ? undefined : key}
              value={value[key]}
              isLast={index === keys.length - 1}
              depth={depth + 1}
            />
          ))}
          <div
            style={{ paddingLeft: depth * 20 + (name ? 0 : 0) }}
            className="hover:bg-black/5 dark:hover:bg-white/5 px-1 rounded ml-4"
          >
            <span className="text-foreground font-bold">{closeBracket}</span>
            {!isLast && <span className="text-foreground">,</span>}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Tool Component ---

const JsonGraphView = ({
  input,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
}) => {
  const { getNodes } = useReactFlow();

  // Export functionality
  const downloadImage = (format: "png" | "jpeg" | "svg") => {
    // We capture the viewport directly which contains the nodes and edges layer
    const viewportElem = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement;
    if (!viewportElem) return;

    // Calculate the bounding box of all nodes to fit the image exactly
    const bounds = getRectOfNodes(nodes);

    // Safety check if graph is empty
    if (bounds.width === 0 || bounds.height === 0) return;

    const padding = 10;
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    const options = {
      backgroundColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim(),
      width: width,
      height: height,
      style: {
        // Force the container dimensions to match the content
        width: `${width}px`,
        height: `${height}px`,
        // Shift the content so that the top-left node is at (padding, padding)
        // This effectively crops out the infinite canvas and centers the graph
        transform: `translate(${-bounds.x + padding}px, ${-bounds.y + padding}px) scale(1)`,
      },
    };

    const download = (dataUrl: string, ext: string) => {
      const a = document.createElement("a");
      a.setAttribute("download", `devutils-graph.${ext}`);
      a.setAttribute("href", dataUrl);
      a.click();
    };

    if (format === "png")
      toPng(viewportElem, options).then((url) => download(url, "png"));
    if (format === "jpeg")
      toJpeg(viewportElem, options).then((url) => download(url, "jpeg"));
    if (format === "svg")
      toSvg(viewportElem, options).then((url) => download(url, "svg"));
  };

  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportRef.current &&
        !exportRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex-1 relative bg-muted/5 border border-border/40 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20 z-10">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Layout className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Graph View
          </span>
        </div>

        <div className="relative" ref={exportRef}>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1.5"
            onClick={() => setShowExportMenu(!showExportMenu)}
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-popover border border-border rounded-md shadow-lg z-50 py-1 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => downloadImage("png")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
              >
                <ImageIcon className="h-3 w-3" /> PNG
              </button>
              <button
                onClick={() => downloadImage("jpeg")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
              >
                <ImageIcon className="h-3 w-3" /> JPEG
              </button>
              <button
                onClick={() => downloadImage("svg")}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2"
              >
                <FileCode className="h-3 w-3" /> SVG
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          proOptions={proOptions}
          className="bg-muted/10"
          style={{ width: "100%", height: "100%" }}
          minZoom={0.1}
          maxZoom={2}
        >
          <Background
            color="currentColor"
            gap={24}
            size={1}
            className="opacity-[0.03]"
          />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
};

const JsonTreeViewWrapper = ({ data }: { data: any }) => {
  return (
    <div className="flex-1 relative border border-border/40 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ListTree className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Tree View
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-background">
        <JsonTreeItem value={data} isLast={true} />
      </div>
    </div>
  );
};

export const JsonTreeTool: React.FC = () => {
  const [input, setInput] = useState(
    '{\n  "project": "DevUtils",\n  "features": [\n    "Offline",\n    "Fast"\n  ],\n  "meta": {\n    "version": 1.0,\n    "author": "You"\n  }\n}'
  );
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<"graph" | "tree">("graph");
  const [parsedData, setParsedData] = useState<any>(null);

  const handleVisualize = useCallback(() => {
    try {
      if (!input.trim()) return;
      const parsed = JSON.parse(input);
      setParsedData(parsed);

      // Parse for Graph View
      const { nodes: rawNodes, edges: rawEdges } = parseJsonToGraph(parsed);
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(rawNodes, rawEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setError(null);
    } catch (e: any) {
      setError(e.message);
      setParsedData(null);
    }
  }, [input, setNodes, setEdges]);

  // Initial render
  useEffect(() => {
    handleVisualize();
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] gap-4">
      {/* React Flow Styles Override */}
      <style>{`
         .react-flow__attribution { display: none !important; }
         .react-flow__controls {
           box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
           border: 1px solid hsl(var(--border)) !important;
           background-color: hsl(var(--card)) !important;
           border-radius: 0.5rem !important;
           padding: 4px !important;
         }
         .react-flow__controls-button {
           background-color: transparent !important;
           border-bottom: none !important;
           border-radius: 0.25rem !important;
           margin-bottom: 2px !important;
           color: hsl(var(--foreground)) !important;
           fill: hsl(var(--foreground)) !important;
           width: 26px !important;
           height: 26px !important;
         }
         .react-flow__controls-button:hover { background-color: hsl(var(--muted)) !important; }
         .react-flow__controls-button svg { fill: currentColor !important; max-width: 14px; max-height: 14px; }
      `}</style>

      {/* Header */}
      <div className="flex flex-col gap-2 pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              JSON Visualizer
            </h1>
            <p className="text-xs text-muted-foreground">
              Visualize JSON data as an interactive graph or tree.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* Left: Input Editor */}
        <div className="w-full lg:w-1/3 flex flex-col min-h-[300px] lg:h-full">
          <div className="flex-1 flex flex-col border border-border/40 rounded-lg overflow-hidden bg-background/50 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Braces className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Input
                </span>
              </div>
              <Button
                size="sm"
                onClick={handleVisualize}
                className="h-7 text-xs px-2.5"
              >
                <Play className="h-3 w-3 mr-1.5" /> Render
              </Button>
            </div>

            <div className="flex-1 relative min-h-0 bg-background">
              <MonacoEditor
                value={input}
                onChange={setInput}
                language="json"
                className="border-none"
              />
            </div>

            {error && (
              <div className="p-2.5 bg-destructive/10 text-destructive text-xs border-t border-destructive/20 flex-none font-medium">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right: Visualization (Graph or Tree) */}
        <div className="w-full lg:w-2/3 h-[500px] lg:h-full flex flex-col gap-4">
          {/* View Switcher */}
          <div className="flex justify-center flex-none">
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setView("graph")}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${view === "graph" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Network className="h-3.5 w-3.5" /> Graph
              </button>
              <button
                onClick={() => setView("tree")}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-medium rounded-md transition-all ${view === "tree" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <ListTree className="h-3.5 w-3.5" /> Tree
              </button>
            </div>
          </div>

          {/* View Content */}
          {view === "graph" ? (
            <ReactFlowProvider>
              <JsonGraphView
                input={input}
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
              />
            </ReactFlowProvider>
          ) : (
            <JsonTreeViewWrapper data={parsedData} />
          )}
        </div>
      </div>
    </div>
  );
};
