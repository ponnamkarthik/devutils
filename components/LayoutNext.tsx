"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileJson,
  Fingerprint,
  Binary,
  Moon,
  Sun,
  Menu,
  X,
  Hammer,
  Github,
  Database,
  Code,
  FileCode,
  ChevronDown,
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
  Search,
  ArrowRightLeft,
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
import { Button } from "./UI";
import Image from "next/image";

const TOOL_GROUPS = [
  {
    label: "Popular",
    items: [
      { name: "JSON Tools", path: "/json/format", icon: FileJson },
      { name: "URL Tools", path: "/url/parser", icon: LinkIcon },
      { name: "Base64 Converter", path: "/base64/encode", icon: Binary },
      { name: "JWT Debugger", path: "/jwt", icon: ShieldCheck },
      { name: "UUID Generator", path: "/uuid", icon: Fingerprint },
      { name: "Hash Generator", path: "/hash", icon: Hash },
      { name: "Hex Converter", path: "/hex", icon: Binary },
      { name: "Regex Tester", path: "/regex", icon: Regex },
      { name: "Code Formatter", path: "/code/formatter", icon: Code },
      { name: "Code Minifier", path: "/code/minifier", icon: FileCode },
      { name: "API Docs Generator", path: "/api-docs", icon: Book },
      { name: "HTTP Request Builder", path: "/http-builder", icon: Send },
      {
        name: "Web Editor",
        path: "https://editor.karthikponnam.dev/",
        icon: FileText,
        isExternal: true,
      },
    ],
  },
  {
    label: "Format & Transform",
    items: [
      { name: "YAML Converter", path: "/yaml/json", icon: FileText },
      { name: "TOML Converter", path: "/toml/json", icon: FileCode },
      { name: "CSV Converter", path: "/csv/json", icon: Sheet },
      { name: "SQL Formatter", path: "/sql", icon: Database },
      { name: "CSS Unit Converter", path: "/css-units", icon: Ruler },
      { name: "CSS Grid Generator", path: "/css-grid", icon: LayoutGrid },
    ],
  },
  {
    label: "Generate & Test",
    items: [
      { name: "Cron Generator", path: "/cron", icon: Clock },
      { name: "Password Generator", path: "/password", icon: KeyRound },
      { name: "Fake Data Generator", path: "/fake-data", icon: Database },
      { name: "QR Code Generator", path: "/qr-code", icon: QrCode },
    ],
  },
  {
    label: "Utilities",
    items: [
      { name: "Diff Viewer", path: "/diff", icon: FileDiff },
      { name: "Log Inspector", path: "/log-inspector", icon: FileSearch },
      { name: "String Inspector", path: "/string-inspector", icon: Type },
      { name: "Color Picker", path: "/color", icon: Palette },
      { name: "SVG Editor", path: "/svg", icon: ImageIcon },
      { name: "Link Preview", path: "/link-preview", icon: Share2 },
      { name: "Internet Speed Test", path: "/speed-test", icon: Activity },
      { name: "World Clock", path: "/world-clock", icon: Globe },
      { name: "Unix Timestamp", path: "/unix-time", icon: Clock },
      { name: "Markdown Editor", path: "/markdown", icon: FileText },
    ],
  },
];

const isPathActive = (itemPath: string, currentPath: string) => {
  if (itemPath.startsWith("http")) return false;
  if (itemPath === "/") return currentPath === "/";
  return currentPath.startsWith(itemPath);
};

const FLAT_TOOLS = TOOL_GROUPS.flatMap((group) =>
  group.items.map((tool) => ({ ...tool, group: group.label }))
);

const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filteredTools = useMemo(() => {
    if (!search) return FLAT_TOOLS;
    const q = search.toLowerCase();
    return FLAT_TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(q) ||
        tool.group.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    setSearch("");
    setSelectedIndex(0);
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredTools.length - 1)
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const tool = filteredTools[selectedIndex];
        if (!tool) return;
        if ((tool as any).isExternal || tool.path.startsWith("http")) {
          window.open(tool.path, "_blank", "noreferrer");
        } else {
          router.push(tool.path);
        }
        onClose();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredTools, isOpen, onClose, router, selectedIndex]);

  useEffect(() => {
    if (!listRef.current) return;
    const selectedElement = listRef.current.children[selectedIndex] as
      | HTMLElement
      | undefined;
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-popover border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-100">
        <div className="flex items-center px-4 py-3 border-b border-border/50">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-lg placeholder:text-muted-foreground/50 focus:outline-none text-foreground"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="pointer-events-none select-none h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex">
              <span className="text-xs">ESC</span>
            </kbd>
          </div>
        </div>

        <div
          ref={listRef}
          className="max-h-[300px] overflow-y-auto p-2 space-y-1 scroll-py-2"
        >
          {filteredTools.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No tools found.
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.path}
                  onClick={() => {
                    if (
                      (tool as any).isExternal ||
                      tool.path.startsWith("http")
                    ) {
                      window.open(tool.path, "_blank", "noreferrer");
                    } else {
                      router.push(tool.path);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                    idx === selectedIndex
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      idx === selectedIndex
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{tool.name}</div>
                    <div className="text-xs text-muted-foreground/80">
                      {tool.group}
                    </div>
                  </div>
                  {((tool as any).isExternal ||
                    tool.path.startsWith("http")) && (
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  )}
                  {idx === selectedIndex && (
                    <ArrowRightLeft className="h-3 w-3 opacity-50" />
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="px-4 py-2 border-t border-border/50 bg-muted/20 text-[10px] text-muted-foreground flex justify-between">
          <span>
            <strong>↑↓</strong> to navigate
          </span>
          <span>
            <strong>↵</strong> to select
          </span>
        </div>
      </div>
    </div>
  );
};

interface DropdownGroupProps {
  label: string;
  items: Array<{ name: string; path: string; icon: any; isExternal?: boolean }>;
}

const DropdownGroup: React.FC<DropdownGroupProps> = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentPath = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isGroupActive = items.some((item) =>
    isPathActive(item.path, currentPath)
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
          isGroupActive || isOpen
            ? "text-primary bg-primary/10"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        {label}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isPathActive(item.path, currentPath);

            if (item.isExternal || item.path.startsWith("http")) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                  <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
                </a>
              );
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  active
                    ? "text-primary bg-primary/5 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const currentPath = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDark ? "dark" : "light";
      setTheme(defaultTheme);
      document.documentElement.classList.toggle(
        "dark",
        defaultTheme === "dark"
      );
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
      if (e.key === "Escape") {
        setIsCommandOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-screen-2xl">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Image
                className="h-8 w-8"
                src="/icon.svg"
                alt="DevUtils"
                width={32}
                height={32}
              />
              {/* <div className="p-1.5 bg-primary/10 rounded-lg">
                <Hammer className="h-5 w-5 text-primary" />
              </div> */}
              <span className="font-bold text-lg hidden sm:inline-block">
                DevUtils
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {TOOL_GROUPS.map((group) => (
                <DropdownGroup
                  key={group.label}
                  label={group.label}
                  items={group.items}
                />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-muted/30 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-all group"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
              <kbd className="pointer-events-none select-none h-5 items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex group-hover:border-primary/30">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <button
              onClick={() => setIsCommandOpen(true)}
              className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
              aria-label="Search tools"
              title="Search tools"
            >
              <Search className="h-5 w-5" />
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <a
              href="https://github.com/ponnamkarthik/devutils"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors"
            >
              <Github className="h-4 w-4" />
            </a>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-9 w-9 p-0"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-card border-l border-border p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-lg">Tools</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {TOOL_GROUPS.map((group) => (
                <div key={group.label}>
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                    {group.label}
                  </h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const active = isPathActive(item.path, currentPath);

                      if (
                        (item as any).isExternal ||
                        item.path.startsWith("http")
                      ) {
                        return (
                          <a
                            key={item.path}
                            href={item.path}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => setSidebarOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                            <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                            active
                              ? "text-primary bg-primary/10 font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 container px-4 pt-4 pb-8 mx-auto max-w-screen-2xl">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-muted/30">
        <div className="container px-4 py-6 mx-auto max-w-screen-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2026 DevUtils. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
