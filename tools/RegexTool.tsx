"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Card, Button, CodeEditor } from "../components/UI";
import {
  Regex,
  Flag,
  Info,
  ChevronRight,
  ChevronDown,
  Check,
  AlertCircle,
  Copy,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

interface FlagState {
  g: boolean; // Global
  i: boolean; // Case Insensitive
  m: boolean; // Multiline
  s: boolean; // Dot All
  u: boolean; // Unicode
  y: boolean; // Sticky
}

const FLAG_INFO: Record<string, { label: string; desc: string }> = {
  g: {
    label: "Global (g)",
    desc: "Find all matches rather than stopping after the first match.",
  },
  i: { label: "Insensitive (i)", desc: "Case-insensitive match." },
  m: { label: "Multiline (m)", desc: "^ and $ match start/end of line." },
  s: {
    label: "Single Line (s)",
    desc: "Allows . to match newline characters.",
  },
  u: {
    label: "Unicode (u)",
    desc: "Treat pattern as a sequence of Unicode code points.",
  },
  y: {
    label: "Sticky (y)",
    desc: "Matches only from the index indicated by lastIndex.",
  },
};

const CHEAT_SHEET = [
  {
    category: "Character Classes",
    items: [
      { token: ".", desc: "Any character except newline" },
      { token: "\\w", desc: "Word (a-z, A-Z, 0-9, _)" },
      { token: "\\d", desc: "Digit (0-9)" },
      { token: "\\s", desc: "Whitespace (space, tab, newline)" },
      { token: "[abc]", desc: "Any of a, b, or c" },
      { token: "[^abc]", desc: "Not a, b, or c" },
      { token: "[a-z]", desc: "Char range a to z" },
    ],
  },
  {
    category: "Anchors",
    items: [
      { token: "^", desc: "Start of string/line" },
      { token: "$", desc: "End of string/line" },
      { token: "\\b", desc: "Word boundary" },
    ],
  },
  {
    category: "Quantifiers",
    items: [
      { token: "*", desc: "0 or more" },
      { token: "+", desc: "1 or more" },
      { token: "?", desc: "0 or 1" },
      { token: "{3}", desc: "Exactly 3" },
      { token: "{3,}", desc: "3 or more" },
      { token: "{3,5}", desc: "3 to 5" },
    ],
  },
  {
    category: "Groups & Lookaround",
    items: [
      { token: "(...)", desc: "Capturing group" },
      { token: "(?:...)", desc: "Non-capturing group" },
      { token: "(?=...)", desc: "Positive lookahead" },
      { token: "(?!...)", desc: "Negative lookahead" },
      { token: "\\1", desc: "Backreference to group 1" },
    ],
  },
];

const explainRegex = (
  pattern: string
): { title: string; desc: string; token: string }[] => {
  if (!pattern) return [];
  const tokens: { title: string; desc: string; token: string }[] = [];
  let i = 0;
  let groupCount = 0;

  while (i < pattern.length) {
    const char = pattern[i];
    let token = char;
    let title = "Literal";
    let desc = `Matches the character "${char}" literally.`;

    if (char === "\\") {
      if (i + 1 < pattern.length) {
        const next = pattern[i + 1];
        token = `\\${next}`;
        i += 2; // Advance past escape

        if (next === "d") {
          title = "Digit";
          desc = "Matches any digit (0-9).";
        } else if (next === "w") {
          title = "Word Character";
          desc = "Matches any letter, number, or underscore.";
        } else if (next === "s") {
          title = "Whitespace";
          desc =
            "Matches any whitespace character (spaces, tabs, line breaks).";
        } else if (next === "b") {
          title = "Word Boundary";
          desc =
            "Matches a position where a word char is not followed or preceded by another word-character.";
        } else if (next === "D") {
          title = "Non-Digit";
          desc = "Matches any character that is not a digit.";
        } else if (next === "W") {
          title = "Non-Word Character";
          desc = "Matches any character that is not a word character.";
        } else if (next === "S") {
          title = "Non-Whitespace";
          desc = "Matches any character that is not a whitespace character.";
        } else {
          title = "Escaped Character";
          desc = `Matches the character "${next}" literally.`;
        }
      } else {
        // Trailing backslash
        title = "Error";
        desc = "Trailing backslash at end of pattern.";
        i++;
      }
    } else if (char === "[") {
      // Character Set
      let j = i + 1;
      let content = "";
      let closed = false;
      // simplistic parser for char set
      while (j < pattern.length) {
        if (pattern[j] === "]" && pattern[j - 1] !== "\\") {
          closed = true;
          break;
        }
        content += pattern[j];
        j++;
      }
      if (closed) {
        token = `[${content}]`;
        title = content.startsWith("^") ? "Negated Set" : "Character Set";
        desc = content.startsWith("^")
          ? `Matches any character NOT in the set: ${content.substring(1)}`
          : `Matches any character in the set: ${content}`;
        i = j + 1;
      } else {
        title = "Unclosed Set";
        desc = "Missing closing bracket ]";
        i++;
      }
    } else if (char === "(") {
      token = "(";
      if (pattern[i + 1] === "?" && pattern[i + 2] === ":") {
        title = "Non-capturing Group";
        desc = "Begins a group that does not capture text.";
        token = "(?:";
        i += 3;
      } else if (pattern[i + 1] === "?" && pattern[i + 2] === "=") {
        title = "Positive Lookahead";
        desc = "Asserts that the regex following matches.";
        token = "(?=";
        i += 3;
      } else if (pattern[i + 1] === "?" && pattern[i + 2] === "!") {
        title = "Negative Lookahead";
        desc = "Asserts that the regex following does NOT match.";
        token = "(?!";
        i += 3;
      } else {
        groupCount++;
        title = `Capturing Group ${groupCount}`;
        desc = "Begins a capturing group.";
        i++;
      }
    } else if (char === ")") {
      token = ")";
      title = "End Group";
      desc = "Ends the current group.";
      i++;
    } else if (char === "^") {
      title = "Start Anchor";
      desc = "Matches the beginning of the string (or line in multiline mode).";
      i++;
    } else if (char === "$") {
      title = "End Anchor";
      desc = "Matches the end of the string (or line in multiline mode).";
      i++;
    } else if (char === ".") {
      title = "Dot";
      desc = "Matches any character except line breaks.";
      i++;
    } else if (char === "|") {
      title = "Alternation";
      desc = "Acts as an OR operator.";
      i++;
    } else {
      // Literal char
      i++;
    }

    // Check for Quantifier immediately following this token
    if (i < pattern.length) {
      const next = pattern[i];
      if (next === "*" || next === "+" || next === "?" || next === "{") {
        let quantifier = "";
        let qDesc = "";

        if (next === "*") {
          quantifier = "*";
          qDesc = "0 or more times";
          i++;
        } else if (next === "+") {
          quantifier = "+";
          qDesc = "1 or more times";
          i++;
        } else if (next === "?") {
          quantifier = "?";
          qDesc = "0 or 1 time";
          i++;
        } else if (next === "{") {
          // Parse {n,m}
          let k = i + 1;
          let qContent = "";
          while (k < pattern.length && pattern[k] !== "}") {
            qContent += pattern[k];
            k++;
          }
          if (k < pattern.length) {
            quantifier = `{${qContent}}`;
            qDesc = `${qContent} times`;
            i = k + 1;
          }
        }

        // Check for lazy ?
        if (i < pattern.length && pattern[i] === "?") {
          quantifier += "?";
          qDesc += " (Lazy)";
          i++;
        }

        token += quantifier;
        desc += ` (Repeats ${qDesc})`;
      }
    }

    tokens.push({ title, desc, token });
  }

  return tokens;
};

export const RegexTool: React.FC = () => {
  const [pattern, setPattern] = useLocalStorage<string>(
    "devutils-regex-pattern",
    String.raw`([A-Z])\w+`
  );
  const [flags, setFlags] = useLocalStorage<FlagState>("devutils-regex-flags", {
    g: true,
    i: false,
    m: true,
    s: false,
    u: false,
    y: false,
  });
  const [text, setText] = useLocalStorage<string>(
    "devutils-regex-text",
    "Welcome to DevUtils Regex Tester!\nUse this tool to test your regular expressions.\n\nCamelCase identifiers are fun.\nPascalCase is also Cool."
  );

  const [sidebarTab, setSidebarTab] = useState<"cheat" | "explain">("cheat");
  const [copiedRegex, setCopiedRegex] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Accordion State
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    {
      "Character Classes": true,
      Anchors: true,
      Quantifiers: true,
      "Groups & Lookaround": false,
    }
  );

  // Safe Regex Execution
  const { matches, error, executionTime } = useMemo<{
    matches: RegExpExecArray[];
    error: string | null;
    executionTime: number;
  }>(() => {
    const start = performance.now();
    try {
      const flagStr = Object.keys(flags)
        .filter((k) => (flags as any)[k])
        .join("");
      const regex = new RegExp(pattern, flagStr);

      let foundMatches: RegExpExecArray[] = [];

      // If global flag is set, matchAll is great. If not, exec gets first match.
      if (flags.g) {
        foundMatches = [...text.matchAll(regex)];
      } else {
        const match = regex.exec(text);
        if (match) foundMatches = [match];
      }

      return {
        matches: foundMatches,
        error: null,
        executionTime: performance.now() - start,
      };
    } catch (e: any) {
      return {
        matches: [],
        error: e?.message ?? "Invalid regex",
        executionTime: 0,
      };
    }
  }, [pattern, flags, text]);

  // Construct regex literal for display/copy
  const flagStr = Object.keys(flags)
    .filter((k) => (flags as any)[k])
    .join("");
  const regexLiteral = `/${pattern}/${flagStr}`;

  const copyRegexLiteral = () => {
    navigator.clipboard.writeText(regexLiteral);
    setCopiedRegex(true);
    setTimeout(() => setCopiedRegex(false), 2000);
  };

  const explanation = useMemo(() => explainRegex(pattern), [pattern]);

  // Helper to render text with highlighted matches
  const renderHighlightedText = () => {
    if (!text) return null;
    if (error || matches.length === 0)
      return <span className="text-muted-foreground">{text}</span>;

    type Segment =
      | { text: string; isMatch: false }
      | {
          text: string;
          isMatch: true;
          id: number;
          groups: Array<string | undefined>;
        };

    const segments: Segment[] = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
      if (match.index === undefined) return;

      if (match.index > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, match.index),
          isMatch: false,
        });
      }

      const matchText = match[0];
      if (matchText.length > 0) {
        segments.push({
          text: matchText,
          isMatch: true,
          id: i,
          groups: match.slice(1), // Capturing groups
        });
      }

      lastIndex = match.index + matchText.length;
    });

    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        isMatch: false,
      });
    }

    return (
      <div className="font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
        {segments.map((seg, idx) => {
          if (seg.isMatch) {
            return (
              <span
                key={idx}
                className="bg-indigo-500/30 text-indigo-900 dark:text-indigo-100 rounded-[2px] border-b-2 border-indigo-500 cursor-help relative group"
              >
                {seg.text}
                {/* Tooltip for groups */}
                {seg.groups && seg.groups.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                    <div className="bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border p-2 whitespace-nowrap min-w-[120px]">
                      <div className="font-semibold border-b border-border/50 mb-1 pb-1">
                        Match {seg.id! + 1}
                      </div>
                      {seg.groups.map((g, gi) => (
                        <div key={gi} className="flex gap-2">
                          <span className="opacity-50">Group {gi + 1}:</span>
                          <span className="font-mono">{g || "undefined"}</span>
                        </div>
                      ))}
                    </div>
                    <div className="w-2 h-2 bg-popover border-r border-b border-border rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2"></div>
                  </div>
                )}
              </span>
            );
          }
          return <span key={idx}>{seg.text}</span>;
        })}
      </div>
    );
  };

  const toggleFlag = (f: keyof FlagState) => {
    setFlags((prev) => ({ ...prev, [f]: !prev[f] }));
  };

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="flex flex-col h-full gap-4 min-h-[600px]">
      {/* --- Top Bar: Regex Input --- */}
      <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex flex-col gap-3 flex-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-md">
            <Regex className="h-5 w-5" />
          </div>
          <h1 className="font-bold text-lg">Regex Tester</h1>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSidebarTab("explain");
                sidebarRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`h-8 gap-1.5 text-xs ${sidebarTab === "explain" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Explain Pattern
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative font-mono text-sm">
            <span className="absolute left-3 top-2.5 text-muted-foreground/50 select-none">
              /
            </span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className={`w-full bg-background border rounded-md py-2 px-6 focus:outline-none focus:ring-1 focus:ring-primary font-mono text-base transition-colors ${error ? "border-red-500 focus:ring-red-500" : "border-input"}`}
              placeholder="Regular Expression..."
            />
            <span className="absolute right-3 top-2.5 text-muted-foreground/50 select-none">
              /
            </span>
          </div>

          {/* Flags Dropdown with Custom Tooltips */}
          <div className="flex gap-1 flex-wrap items-center">
            {Object.entries(flags).map(([key, active]) => {
              const info = FLAG_INFO[key];
              return (
                <div key={key} className="relative group">
                  <button
                    onClick={() => toggleFlag(key as keyof FlagState)}
                    className={`px-3 py-2 rounded-md text-sm font-mono font-medium border transition-all ${active ? "bg-primary/10 border-primary text-primary" : "bg-background border-input text-muted-foreground hover:bg-muted"}`}
                  >
                    {key}
                  </button>
                  {/* Custom Tailwind Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-48 pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-200">
                    <div className="bg-popover text-popover-foreground text-xs rounded-md shadow-lg border border-border p-2.5 text-center">
                      <div className="font-semibold mb-1 text-primary">
                        {info.label}
                      </div>
                      <div className="text-muted-foreground leading-snug">
                        {info.desc}
                      </div>
                    </div>
                    <div className="w-2.5 h-2.5 bg-popover border-r border-b border-border rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Literal Display & Error */}
        <div className="flex items-start justify-between gap-4 min-h-[42px] bg-muted/20 p-2 rounded-md border border-border/40">
          {error ? (
            <div className="text-xs text-red-500 flex items-center gap-1.5 animate-in slide-in-from-top-1 py-1">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none shrink-0">
                Pattern:
              </span>
              <code className="font-mono text-sm text-foreground truncate">
                {regexLiteral}
              </code>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={copyRegexLiteral}
            className="h-7 px-3 text-xs hover:bg-muted shrink-0"
            title="Copy Regex Literal"
          >
            {copiedRegex ? (
              <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1.5" />
            )}
            {copiedRegex ? "Copied" : "Copy Literal"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
        {/* --- Left Pane: Editor & Preview --- */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
          {/* Text Input */}
          <Card className="flex flex-col p-0 h-1/2 border-border/60 shadow-sm bg-card/50">
            {/* Reduced X padding */}
            <div className="flex items-center justify-between p-2 px-2 border-b border-border/40 bg-muted/20">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Test String
              </span>
            </div>
            <textarea
              value={text}
              rows={5}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 w-full bg-transparent p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Enter text to match against..."
              spellCheck={false}
            />
          </Card>

          {/* Highlighted Output */}
          <Card className="flex flex-col p-0 h-1/2 border-border/60 shadow-sm bg-card/50 relative overflow-hidden">
            {/* Reduced X padding */}
            <div className="flex items-center justify-between p-2 px-2 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Match Preview
                </span>
                {matches.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-medium">
                    {matches.length} Match{matches.length !== 1 ? "es" : ""}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {executionTime.toFixed(2)}ms
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4 bg-muted/10 relative">
              {renderHighlightedText()}

              {/* Empty State */}
              {!text && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30 pointer-events-none">
                  Enter text to see matches...
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* --- Right Pane: Reference & Explain --- */}
        {/* Fixed width, non-collapsible sidebar */}
        <div
          ref={sidebarRef}
          className="w-full lg:w-80 flex flex-col gap-4 h-full"
        >
          <Card className="flex-1 flex flex-col p-0 border-border/60 h-full overflow-hidden">
            {/* Sidebar Header / Tab Toggle */}
            <div className="flex items-center justify-between p-2 border-b border-border bg-muted/30 flex-none">
              <div className="flex-1 flex gap-2">
                <button
                  onClick={() => setSidebarTab("cheat")}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${sidebarTab === "cheat" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Cheat Sheet
                </button>
                <button
                  onClick={() => setSidebarTab("explain")}
                  className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-medium rounded-md transition-colors ${sidebarTab === "explain" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  Explanation
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {sidebarTab === "cheat" ? (
                // CHEAT SHEET CONTENT - ACCORDION STYLE
                <div className="animate-in fade-in duration-300">
                  {CHEAT_SHEET.map((section, i) => {
                    const isOpen = openCategories[section.category];
                    return (
                      <div
                        key={i}
                        className="border-b border-border/40 last:border-0"
                      >
                        <div
                          onClick={() => toggleCategory(section.category)}
                          className="bg-muted/20 px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/40 transition-colors flex items-center justify-between select-none"
                        >
                          {section.category}
                          <ChevronRight
                            className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                          />
                        </div>

                        {/* Accordion Content */}
                        {isOpen && (
                          <div className="divide-y divide-border/30 bg-background/50">
                            {section.items.map((item, j) => (
                              <div
                                key={j}
                                className="px-3 py-2 flex items-start gap-3 hover:bg-muted/30 transition-colors text-sm group cursor-pointer"
                                onClick={() =>
                                  setPattern((prev) => prev + item.token)
                                }
                              >
                                <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono text-xs whitespace-nowrap group-hover:bg-primary/10 transition-colors">
                                  {item.token}
                                </code>
                                <span className="text-muted-foreground text-xs leading-relaxed">
                                  {item.desc}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                // EXPLANATION CONTENT
                <div className="p-4 space-y-4 animate-in fade-in duration-300">
                  {explanation.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      Enter a pattern to see an explanation.
                    </div>
                  ) : (
                    explanation.map((item, idx) => (
                      <div key={idx} className="flex gap-3 group">
                        <div className="mt-0.5">
                          <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-mono font-bold">
                            {item.token}
                          </code>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-foreground mb-0.5">
                            {item.title}
                          </div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Explanation Footer */}
                  {explanation.length > 0 && (
                    <div className="pt-4 border-t border-border mt-4">
                      <p className="text-[10px] text-muted-foreground text-center">
                        Generated by simple tokenizer. Complex logic (e.g.
                        nested backreferences) may vary.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
