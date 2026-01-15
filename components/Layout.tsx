import React, { useState, useEffect, useRef, useMemo } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
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
  Command,
  ArrowRightLeft,
  ShieldCheck,
  FileText,
  Send,
  KeyRound,
} from "lucide-react";
import { Button } from "./UI";

// Grouping tools for the dropdowns
const TOOL_GROUPS = [
  {
    label: "Format & Transform",
    items: [
      { name: "JSON Tools", path: "/json/format", icon: FileJson },
      { name: "YAML Converter", path: "/yaml/json", icon: FileText },
      { name: "CSV Converter", path: "/csv/json", icon: Sheet },
      { name: "SQL Formatter", path: "/sql", icon: Database },
      { name: "URL Tools", path: "/url/parser", icon: LinkIcon },
      { name: "Markdown Editor", path: "/markdown", icon: FileText },
      {
        name: "Web Editor",
        path: "https://editor.karthikponnam.dev/",
        icon: FileText,
        isExternal: true,
      },
      { name: "Code Formatter", path: "/code/format", icon: FileCode },
      { name: "Code Minifier", path: "/code/minify", icon: Code },
      { name: "Diff Viewer", path: "/diff", icon: FileDiff },
      { name: "Base64 Tool", path: "/base64/encode", icon: Binary },
      { name: "JSON to Types", path: "/json/converter", icon: FileType },
    ],
  },
  {
    label: "Generators & Utils",
    items: [
      { name: "HTTP Builder", path: "/http/builder", icon: Send },
      { name: "Password Gen", path: "/password", icon: KeyRound },
      { name: "Unix Timestamp", path: "/unix", icon: Clock },
      { name: "JWT Debugger", path: "/jwt", icon: ShieldCheck },
      { name: "String Inspector", path: "/string-inspector", icon: Type },
      { name: "World Clock", path: "/world-clock", icon: Globe },
      { name: "Color Picker", path: "/color", icon: Palette },
      { name: "Fake Data", path: "/fake-data", icon: Type },
      { name: "UUID Generator", path: "/uuid", icon: Fingerprint },
      { name: "Hash Generator", path: "/hash", icon: Hash },
      { name: "QR Code", path: "/qrcode", icon: QrCode },
      { name: "Cron Generator", path: "/cron", icon: Clock },
      { name: "Regex Tester", path: "/regex", icon: Regex },
      { name: "JSON Graph", path: "/json/graph", icon: Network },
      {
        name: "Image Tools",
        path: "https://optiimg.karthikponnam.dev/",
        icon: ImageIcon,
        isExternal: true,
      },
    ],
  },
];

// Flatten tools for search
const FLAT_TOOLS = TOOL_GROUPS.flatMap((g) =>
  g.items.map((t) => ({ ...t, group: g.label }))
);

// Helper to determine active state including sub-routes
const isPathActive = (itemPath: string, currentPath: string) => {
  if (itemPath.startsWith("http")) return false;
  if (itemPath === "/") return currentPath === "/";
  // Specific logic for grouped paths
  if (itemPath === "/json/graph") return currentPath === "/json/graph";
  if (itemPath === "/json/converter") return currentPath === "/json/converter";
  if (
    itemPath.startsWith("/json") &&
    currentPath.startsWith("/json") &&
    !currentPath.includes("graph") &&
    !currentPath.includes("converter")
  )
    return true;
  if (itemPath.startsWith("/csv")) return currentPath.startsWith("/csv");
  if (itemPath.startsWith("/base64")) return currentPath.startsWith("/base64");
  if (itemPath.startsWith("/yaml")) return currentPath.startsWith("/yaml");
  if (itemPath.startsWith("/http")) return currentPath.startsWith("/http");

  // Exact match for others to prevent overlaps
  if (itemPath === "/code/format") return currentPath === "/code/format";
  if (itemPath === "/code/minify") return currentPath === "/code/minify";
  if (itemPath === "/cron") return currentPath === "/cron";
  if (itemPath === "/regex") return currentPath === "/regex";
  if (itemPath === "/hash") return currentPath === "/hash";
  if (itemPath === "/diff") return currentPath === "/diff";
  if (itemPath === "/qrcode") return currentPath === "/qrcode";
  if (itemPath === "/fake-data") return currentPath === "/fake-data";
  if (itemPath === "/string-inspector")
    return currentPath === "/string-inspector";
  if (itemPath === "/unix") return currentPath === "/unix";
  if (itemPath === "/jwt") return currentPath === "/jwt";
  if (itemPath === "/password") return currentPath === "/password";
  if (itemPath === "/markdown") return currentPath === "/markdown";
  if (itemPath.startsWith("/url")) return currentPath.startsWith("/url");
  if (itemPath === "/color") return currentPath === "/color";
  if (itemPath === "/world-clock") return currentPath === "/world-clock";

  return currentPath.startsWith(itemPath);
};

// Dropdown Component for Desktop
const NavDropdown: React.FC<{
  label: string;
  items: (typeof TOOL_GROUPS)[0]["items"];
  currentPath: string;
}> = ({ label, items, currentPath }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
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
          className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute left-0 mt-2 w-56 rounded-lg border border-border bg-popover shadow-lg transition-all duration-200 z-50 origin-top-left ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0 visible"
            : "opacity-0 scale-95 -translate-y-2 invisible"
        }`}
      >
        <div className="p-1.5 space-y-0.5">
          {items.map((item) => {
            if ((item as any).isExternal) {
              return (
                <a
                  key={item.path}
                  href={item.path}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="h-4 w-4 opacity-70" />
                  {item.name}
                  <ExternalLink className="h-3 w-3 opacity-50 ml-auto" />
                </a>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={() =>
                  `flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isPathActive(item.path, currentPath)
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon className="h-4 w-4 opacity-70" />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Command Palette Component
const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filteredTools = useMemo(() => {
    if (!search) return FLAT_TOOLS;
    return FLAT_TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.group.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, filteredTools.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const tool = filteredTools[selectedIndex];
        if (tool) {
          if ((tool as any).isExternal) {
            window.open(tool.path, "_blank");
          } else {
            navigate(tool.path);
          }
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, navigate, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
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
            <kbd className="pointer-events-none select-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex">
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
            filteredTools.map((tool, idx) => (
              <button
                key={tool.path}
                onClick={() => {
                  if ((tool as any).isExternal)
                    window.open(tool.path, "_blank");
                  else navigate(tool.path);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-colors ${
                  idx === selectedIndex
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <tool.icon
                  className={`h-5 w-5 ${idx === selectedIndex ? "text-primary" : "text-muted-foreground"}`}
                />
                <div className="flex-1">
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-xs text-muted-foreground/80">
                    {tool.group}
                  </div>
                </div>
                {idx === selectedIndex && (
                  <ArrowRightLeft className="h-3 w-3 opacity-50" />
                )}
              </button>
            ))
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

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const location = useLocation();
  const mainScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Global Command Palette Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Scroll to top of main content on route change
  useEffect(() => {
    if (mainScrollRef.current) {
      // Use 'instant' to prevent visual scrolling animation when navigating
      mainScrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  // Custom Links for Header (The "Best" Tools)
  const QUICK_LINKS = [
    { name: "JSON", path: "/json/format", icon: FileJson },
    { name: "UUID", path: "/uuid", icon: Fingerprint },
    { name: "Base64", path: "/base64/encode", icon: Binary },
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      {/* Top Navigation Bar - Fixed Height */}
      <header className="flex-none z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center gap-6">
            {/* Logo & Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-md"
              aria-label="Go to Dashboard"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Hammer className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight hidden sm:inline-block">
                DevUtils
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Quick Links */}
              {QUICK_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`
                  }
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </NavLink>
              ))}

              <div className="w-px h-4 bg-border/60 mx-2"></div>

              {TOOL_GROUPS.map((group) => (
                <NavDropdown
                  key={group.label}
                  label={group.label}
                  items={group.items}
                  currentPath={location.pathname}
                />
              ))}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md border border-input bg-muted/30 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-all group"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search...</span>
              <kbd className="pointer-events-none select-none h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 flex group-hover:border-primary/30">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            <button
              onClick={() => setIsCommandOpen(true)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <Search className="h-5 w-5" />
            </button>

            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              title="View on GitHub"
            >
              <Github className="h-5 w-5" />
            </a>

            <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 px-0 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden ml-1 rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden animate-in slide-in-from-top-5 duration-200 pt-20 px-6 overflow-y-auto">
          <nav className="flex flex-col gap-6 pb-10">
            <NavLink
              to="/"
              className={() =>
                `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                  location.pathname === "/"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </NavLink>

            <div className="space-y-2">
              <h4 className="px-4 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                Favorites
              </h4>
              <div className="flex flex-col gap-1">
                {QUICK_LINKS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={() =>
                      `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                        isPathActive(item.path, location.pathname)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>

            {TOOL_GROUPS.map((group) => (
              <div key={group.label} className="space-y-2">
                <h4 className="px-4 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
                  {group.label}
                </h4>
                <div className="flex flex-col gap-1">
                  {group.items.map((item) => {
                    if ((item as any).isExternal) {
                      return (
                        <a
                          key={item.path}
                          href={item.path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                          <ExternalLink className="h-4 w-4 opacity-50 ml-auto" />
                        </a>
                      );
                    }
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={() =>
                          `flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                            isPathActive(item.path, location.pathname)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Content Area - Split into Scrollable Content and Fixed Footer */}
      <main
        ref={mainScrollRef}
        className="flex-1 w-full overflow-y-auto scroll-smooth relative flex flex-col"
      >
        <div className="flex-1 w-full ">
          <div className="w-full p-4 sm:p-6 lg:p-8 min-h-full flex flex-col">
            {children}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <footer className="flex-none pt-4 pb-6 border-t border-border/40 bg-background/95 backdrop-blur-sm z-10 px-6 sm:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-sm text-muted-foreground">
            <p className="text-center md:text-left">
              &copy; {new Date().getFullYear()} DevUtils. Open Source & Privacy
              First.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </a>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
