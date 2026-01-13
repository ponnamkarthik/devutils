"use client";

import React from "react";
import Link from "next/link";
import { Card } from "../components/UI";
import {
  FileJson,
  Fingerprint,
  Binary,
  Code,
  Database,
  ArrowRight,
  FileCode,
  Sheet,
  Clock,
  Regex,
  Hash,
  Network,
  FileType,
  FileDiff,
  QrCode,
  Type,
  Link as LinkIcon,
  Palette,
  Image as ImageIcon,
  ExternalLink,
  Globe,
  ShieldCheck,
  FileText,
  Send,
  KeyRound,
  Ruler,
  LayoutGrid,
  Activity,
  Share2,
  FileSearch,
  Book,
} from "lucide-react";

const TOOLS = [
  {
    title: "JSON Tools",
    description:
      "Format, validate, and minify JSON data with intelligent error highlighting.",
    icon: FileJson,
    path: "/json/format",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    title: "URL Tools",
    description:
      "Parse, build, encode, and decode URLs with an interactive query builder.",
    icon: LinkIcon,
    path: "/url/parser",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Base64 Converter",
    description:
      "Encode and decode text or files to Base64 format securely in your browser.",
    icon: Binary,
    path: "/base64/encode",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "JWT Debugger",
    description:
      "Decode JSON Web Tokens to inspect headers, payloads, and signatures.",
    icon: ShieldCheck,
    path: "/jwt",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    title: "UUID Generator",
    description:
      "Generate RFC4122 version 4 UUIDs using cryptographically strong random values.",
    icon: Fingerprint,
    path: "/uuid",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Hash Generator",
    description:
      "Calculate SHA-256, SHA-512, and other hashes from text or files securely.",
    icon: Hash,
    path: "/hash",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    title: "Hex Converter",
    description:
      "Convert text to hex and decode hex back to text. Includes decimal/hex/binary/octal base conversion.",
    icon: Binary,
    path: "/hex",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Regex Tester",
    description:
      "Test regular expressions against text with real-time highlighting and explanations.",
    icon: Regex,
    path: "/regex",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    title: "Code Formatter",
    description:
      "Prettify JS, TS, HTML, CSS, Markdown, and YAML using Prettier.",
    icon: FileCode,
    path: "/code/formatter",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Code Minifier",
    description: "Minify JavaScript, CSS, and HTML files offline.",
    icon: Code,
    path: "/code/minifier",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "SQL Formatter",
    description:
      "Beautify SQL queries with dialect support (MySQL, Postgres, etc.).",
    icon: Database,
    path: "/sql",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "YAML Converter",
    description:
      "Convert between YAML and JSON with validation and live preview.",
    icon: FileText,
    path: "/yaml/json",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    title: "TOML Converter",
    description: "Convert TOML to JSON and JSON to TOML.",
    icon: FileCode,
    path: "/toml/json",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "CSV Converter",
    description:
      "Convert CSV to JSON and vice versa. Supports large files and file downloads.",
    icon: Sheet,
    path: "/csv/json",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "JSON Graph",
    description:
      "Visualize JSON objects as interactive node graphs. Perfect for understanding structure.",
    icon: Network,
    path: "/json/graph",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "JSON to Types",
    description:
      "Convert JSON to TypeScript, Go, Java, Kotlin, Rust, Dart, Python, and C# models.",
    icon: FileType,
    path: "/json/converter",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Diff Viewer",
    description:
      "Compare text, JSON, or code side-by-side to identify differences quickly.",
    icon: FileDiff,
    path: "/diff",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "String Inspector",
    description:
      "Analyze character counts, bytes (UTF-8), word distribution, and Unicode points.",
    icon: Type,
    path: "/string-inspector",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Log Inspector",
    description:
      "Inspect and filter JSON and Common Log Format (CLF) logs with level toggles and search.",
    icon: FileSearch,
    path: "/log-inspector",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "API Docs Generator",
    description:
      "Convert Postman Collection v2.1 or OpenAPI v3 (JSON/YAML) into a single HTML documentation page.",
    icon: Book,
    path: "/api-docs",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "HTTP Request Builder",
    description:
      "Construct API requests with params, auth, and body. Export to cURL, Fetch, and Axios.",
    icon: Send,
    path: "/http-builder",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
  },
  {
    title: "Link Preview",
    description: "Generate meta tags & preview social cards.",
    icon: Share2,
    path: "/link-preview",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Color Picker",
    description:
      "Advanced OKLCH color picker with P3 support, palettes, and contrast checking.",
    icon: Palette,
    path: "/color",
    color: "text-pink-600",
    bgColor: "bg-pink-600/10",
  },
  {
    title: "CSS Unit Converter",
    description: "Convert between px, rem, em, %, vw, and more.",
    icon: Ruler,
    path: "/css-units",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "CSS Grid Generator",
    description:
      "Visually build CSS Grid layouts and export CSS + HTML for grid-template, gaps, and grid-area.",
    icon: LayoutGrid,
    path: "/css-grid",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "SVG Editor",
    description: "View, optimize, edit, and transform SVG code.",
    icon: ImageIcon,
    path: "/svg",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Markdown Editor",
    description:
      "Write Markdown with real-time preview. Export to HTML or print-ready PDF.",
    icon: FileText,
    path: "/markdown",
    color: "text-slate-600",
    bgColor: "bg-slate-600/10",
  },
  {
    title: "QR Code Generator",
    description:
      "Create customizable QR codes for URLs, text, and Wi-Fi credentials instantly.",
    icon: QrCode,
    path: "/qr-code",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
  {
    title: "Password Generator",
    description:
      "Create strong passwords or diceware passphrases with entropy analysis.",
    icon: KeyRound,
    path: "/password",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Fake Data Generator",
    description:
      "Generate Lorem Ipsum text or structured mock data (JSON/CSV) for testing.",
    icon: Type,
    path: "/fake-data",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    title: "Cron Generator",
    description:
      "Create and decipher cron schedule expressions with plain English explanations.",
    icon: Clock,
    path: "/cron",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    title: "Unix Timestamp",
    description:
      "Convert between Unix timestamps and human-readable dates. Real-time clock included.",
    icon: Clock,
    path: "/unix-time",
    color: "text-cyan-600",
    bgColor: "bg-cyan-600/10",
  },
  {
    title: "World Clock",
    description:
      "Plan meetings across timezones with a visual 24-hour grid comparison.",
    icon: Globe,
    path: "/world-clock",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    title: "Internet Speed Test",
    description: "Estimate download speed and latency in-browser.",
    icon: Activity,
    path: "/speed-test",
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
  },
  {
    title: "Image Compressor",
    description:
      "Compress and convert images (PNG, JPEG, WebP) locally. High performance.",
    icon: ImageIcon,
    path: "https://optiimg.karthikponnam.dev/",
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    isExternal: true,
  },
];

export const Home: React.FC = () => {
  return (
    <div className="space-y-8 w-full">
      <div className="space-y-3">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Welcome to DevUtils
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Essential developer tools. 100% Client-side. Offline ready. No
          tracking.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TOOLS.map((tool) => {
          if ((tool as any).isExternal) {
            return (
              <a
                key={tool.title}
                href={tool.path}
                target="_blank"
                rel="noreferrer"
                className="block h-full"
              >
                <Card className="p-2 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-primary/20 group relative">
                  <div className="absolute top-4 right-4 text-muted-foreground/30 group-hover:text-primary transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div
                      className={`rounded-lg p-2.5 ${tool.bgColor} ${tool.color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}
                    >
                      <tool.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-all group-hover:text-primary group-hover:translate-x-1" />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                </Card>
              </a>
            );
          }

          return (
            <Link key={tool.title} href={tool.path} className="block h-full">
              <Card className="p-2 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/60 hover:border-primary/20 group">
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-lg p-2.5 ${tool.bgColor} ${tool.color} ring-1 ring-inset ring-black/5 dark:ring-white/10`}
                  >
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-all group-hover:text-primary group-hover:translate-x-1" />
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
