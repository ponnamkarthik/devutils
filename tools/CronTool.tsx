"use client";

import React, { useState, useEffect } from "react";
import { Button, Card } from "../components/UI";
import {
  Clock,
  Copy,
  Check,
  RotateCcw,
  ChevronRight,
  Hash,
  Layers,
  Command,
  Info,
  Sparkles,
  ListFilter,
  Sliders,
  ArrowRightLeft,
} from "lucide-react";
// @ts-ignore
import cronstrue from "cronstrue";

type CronField = "minute" | "hour" | "day" | "month" | "weekday";

// Constants for ranges
const RANGES = {
  minute: { min: 0, max: 59, label: "Minutes", short: "MIN" },
  hour: { min: 0, max: 23, label: "Hours", short: "HOUR" },
  day: { min: 1, max: 31, label: "Day of Month", short: "DAY" },
  month: { min: 1, max: 12, label: "Month", short: "MON" },
  weekday: { min: 0, max: 6, label: "Day of Week", short: "WEEK" }, // 0 = Sunday
};

const NAMES = {
  month: [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ],
  weekday: ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"],
};

const PRESETS = [
  { label: "Every Minute", val: "* * * * *", desc: "Runs once a minute" },
  {
    label: "Every 5 Minutes",
    val: "*/5 * * * *",
    desc: "Runs every 5 minutes",
  },
  { label: "Hourly", val: "0 * * * *", desc: "Runs at minute 0 of every hour" },
  {
    label: "Daily @ Midnight",
    val: "0 0 * * *",
    desc: "Runs once a day at 00:00",
  },
  {
    label: "Daily @ Noon",
    val: "0 12 * * *",
    desc: "Runs once a day at 12:00",
  },
  {
    label: "Weekly (Sunday)",
    val: "0 0 * * 0",
    desc: "Runs once a week on Sunday",
  },
  {
    label: "Work Hours",
    val: "0 9-17 * * 1-5",
    desc: "Hourly from 9 AM to 5 PM, Mon-Fri",
  },
  {
    label: "Monthly (1st)",
    val: "0 0 1 * *",
    desc: "Runs at 00:00 on day 1 of the month",
  },
  {
    label: "Quarterly",
    val: "0 0 1 */3 *",
    desc: "Runs on day 1 of every 3rd month",
  },
  { label: "Yearly (Jan 1st)", val: "0 0 1 1 *", desc: "Runs once a year" },
];

export const CronTool: React.FC = () => {
  const [expression, setExpression] = useState("*/15 * * * *");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Tab state for the builder
  const [activeTab, setActiveTab] = useState<CronField>("minute");

  // Breakdown of the expression parts
  const [parts, setParts] = useState({
    minute: "*/15",
    hour: "*",
    day: "*",
    month: "*",
    weekday: "*",
  });

  // Update description when expression changes
  useEffect(() => {
    try {
      const desc = cronstrue.toString(expression, { verbose: true });
      setDescription(desc);
      setError(null);
    } catch (e) {
      setError("Invalid cron expression");
      setDescription("");
    }
  }, [expression]);

  // Sync parts when expression input changes manually
  const handleInputChange = (val: string) => {
    setExpression(val);
    const split = val.trim().split(/\s+/);
    if (split.length >= 5) {
      setParts({
        minute: split[0],
        hour: split[1],
        day: split[2],
        month: split[3],
        weekday: split[4],
      });
    }
  };

  // Sync expression when a part is updated via builder
  const updatePart = (field: CronField, value: string) => {
    const newParts = { ...parts, [field]: value };
    setParts(newParts);
    setExpression(
      `${newParts.minute} ${newParts.hour} ${newParts.day} ${newParts.month} ${newParts.weekday}`
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const FieldEditor: React.FC<{
    field: CronField;
    value: string;
    onChange: (v: string) => void;
  }> = ({ field, value, onChange }) => {
    const { min, max, label } = RANGES[field];

    // Determine current value mode
    const isEvery = value === "*";
    const isStep = value.includes("/");
    const isRange = value.includes("-") && !value.includes(",");
    const isList = value.includes(",") || (!isEvery && !isStep && !isRange);

    const [mode, setMode] = useState<"every" | "list" | "step" | "range">(
      isEvery ? "every" : isStep ? "step" : isRange ? "range" : "list"
    );

    // Update internal mode if value changes externally (e.g. presets)
    useEffect(() => {
      if (value === "*") setMode("every");
      else if (value.includes("/")) setMode("step");
      else if (value.includes("-") && !value.includes(",")) setMode("range");
      else setMode("list");
    }, [value]);

    // Render grid for list selection
    const renderGrid = () => {
      const items: JSX.Element[] = [];
      for (let i = min; i <= max; i++) {
        let itemLabel = i.toString();
        // Add padding for single digits to align grid better
        itemLabel = i < 10 ? `0${i}` : `${i}`;

        if (field === "month") itemLabel = NAMES.month[i - 1];
        if (field === "weekday") itemLabel = NAMES.weekday[i];

        const currentList = value === "*" ? [] : value.split(",");
        const isSelected = currentList.includes(i.toString());

        items.push(
          <button
            key={i}
            onClick={() => {
              let newList = currentList;
              // Clean up currentList if it has invalid/other format values
              if (value.includes("/") || value.includes("-")) newList = [];

              if (newList.includes(i.toString())) {
                newList = newList.filter((v) => v !== i.toString());
              } else {
                newList.push(i.toString());
              }

              if (newList.length === 0) {
                onChange("*");
              } else {
                onChange(
                  newList.sort((a, b) => parseInt(a) - parseInt(b)).join(",")
                );
              }
            }}
            className={`
                        text-[11px] sm:text-xs py-2 rounded-md border transition-all font-medium flex items-center justify-center
                        ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary ring-2 ring-primary/20 z-10"
                            : "bg-background hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                        }
                    `}
          >
            {itemLabel}
          </button>
        );
      }
      return (
        <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-8 xl:grid-cols-10 gap-2 max-h-[260px] overflow-y-auto custom-scrollbar p-1">
            {items}
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => onChange("*")}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Clear Selection
            </button>
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-6">
        {/* Mode Switcher */}
        <div className="flex flex-wrap p-1.5 bg-muted/40 rounded-xl w-full border border-border/40">
          {[
            { id: "every", label: "Every", icon: RotateCcw },
            { id: "list", label: "Specific", icon: ListFilter },
            { id: "step", label: "Step", icon: Sliders },
            { id: "range", label: "Range", icon: ArrowRightLeft },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as any);
                if (m.id === "every") onChange("*");
                if (m.id === "step") onChange("*/1");
                if (m.id === "range") onChange(`${min}-${min + 1}`);
                if (m.id === "list") onChange(min.toString());
              }}
              className={`
                            flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-medium rounded-lg capitalize transition-all duration-200
                            ${
                              mode === m.id
                                ? "bg-background shadow-sm text-primary ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            }
                        `}
            >
              <m.icon className="h-3.5 w-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Editor Body */}
        <div className="min-h-[120px] flex flex-col justify-center">
          {mode === "every" && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-medium text-foreground">
                  Matches Any Value
                </p>
                <p className="text-sm text-muted-foreground">
                  The wildcard <code>*</code> field runs for every{" "}
                  {label.toLowerCase().slice(0, -1)}.
                </p>
              </div>
            </div>
          )}

          {mode === "step" && (
            <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex items-center gap-4">
                <div className="text-right">
                  <span className="block text-sm font-medium text-foreground">
                    Every
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Interval
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    className="w-24 h-12 text-center text-2xl font-bold rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    min={1}
                    max={max}
                    value={value.split("/")[1] || "1"}
                    onChange={(e) => onChange(`*/${e.target.value}`)}
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-foreground">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Starting at 0
                  </span>
                </div>
              </div>
            </div>
          )}

          {mode === "range" && (
            <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm flex flex-wrap justify-center items-center gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                    From
                  </span>
                  <select
                    className="h-10 px-4 pr-8 rounded-lg border border-input bg-background text-sm min-w-[120px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:border-primary/50 transition-colors"
                    value={value.split("-")[0] || min}
                    onChange={(e) =>
                      onChange(
                        `${e.target.value}-${value.split("-")[1] || max}`
                      )
                    }
                  >
                    {Array.from(
                      { length: max - min + 1 },
                      (_, i) => i + min
                    ).map((i) => (
                      <option key={i} value={i}>
                        {field === "weekday"
                          ? NAMES.weekday[i]
                          : field === "month"
                            ? NAMES.month[i - 1]
                            : i}
                      </option>
                    ))}
                  </select>
                </div>

                <ArrowRightLeft className="h-5 w-5 text-muted-foreground mt-5" />

                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider ml-1">
                    To
                  </span>
                  <select
                    className="h-10 px-4 pr-8 rounded-lg border border-input bg-background text-sm min-w-[120px] focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:border-primary/50 transition-colors"
                    value={value.split("-")[1] || max}
                    onChange={(e) =>
                      onChange(
                        `${value.split("-")[0] || min}-${e.target.value}`
                      )
                    }
                  >
                    {Array.from(
                      { length: max - min + 1 },
                      (_, i) => i + min
                    ).map((i) => (
                      <option key={i} value={i}>
                        {field === "weekday"
                          ? NAMES.weekday[i]
                          : field === "month"
                            ? NAMES.month[i - 1]
                            : i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === "list" && renderGrid()}
        </div>
      </div>
    );
  };

  // --- UI ---

  const setPreset = (expr: string) => {
    handleInputChange(expr);
  };

  const renderSegment = (field: CronField, label: string) => {
    const isActive = activeTab === field;
    const val = parts[field];
    return (
      <button
        onClick={() => setActiveTab(field)}
        className={`
                flex flex-col items-center justify-center gap-1.5 flex-1 min-w-[60px] py-4 transition-all duration-200 group relative
                ${isActive ? "bg-primary/5" : "hover:bg-muted/50"}
            `}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
        >
          {label}
        </span>
        <span
          className={`text-xl sm:text-2xl font-mono font-medium transition-colors ${isActive ? "text-primary" : "text-foreground"}`}
        >
          {val}
        </span>
        {/* Active Indicator Line */}
        {isActive && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40 flex-none">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cron Expression Generator
            </h1>
            <p className="text-xs text-muted-foreground">
              Build cron schedules and understand them in plain English.
            </p>
          </div>
        </div>
      </div>

      {/* Top Section: Visualization & Builder Bar */}
      <div className="flex flex-col gap-6">
        {/* Hero Description */}
        <div className="text-center space-y-3 py-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight flex items-center justify-center gap-3">
            <Sparkles className="h-6 w-6 text-yellow-500 hidden sm:block" />
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {description || "..."}
            </span>
            <Sparkles className="h-6 w-6 text-yellow-500 hidden sm:block" />
          </h2>
          {error && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-1">
              <Info className="h-4 w-4" /> {error}
            </div>
          )}
        </div>

        {/* Interactive Cron Builder Bar */}
        <Card
          className="p-0 border-border shadow-sm overflow-hidden divide-x divide-border/30 flex flex-wrap"
          childrenClassNames="!flex-row w-full"
        >
          {renderSegment("minute", "Minute")}
          {renderSegment("hour", "Hour")}
          {renderSegment("day", "Day")}
          {renderSegment("month", "Month")}
          {renderSegment("weekday", "Week")}
        </Card>

        {/* Raw Input Toggle */}
        <div className="flex justify-center">
          <div className="relative group w-full max-w-lg">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              <Hash className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={expression}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full bg-background border border-border rounded-full pl-10 pr-24 py-2.5 text-center font-mono text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              placeholder="Enter cron expression..."
            />
            <div className="absolute inset-y-0 right-1.5 flex items-center">
              <Button
                onClick={copyToClipboard}
                size="sm"
                className={`h-8 px-4 rounded-full text-xs gap-1.5 transition-all ${copied ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor & Presets Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Editor Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="flex flex-col border-border/60 shadow-md overflow-hidden bg-card/50">
            <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                Edit {RANGES[activeTab].label}
              </span>
            </div>
            <div className="p-6">
              <div className="max-w-3xl mx-auto">
                <FieldEditor
                  field={activeTab}
                  value={parts[activeTab]}
                  onChange={(v) => updatePart(activeTab, v)}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Presets */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="flex flex-col border-border/60 shadow-sm overflow-hidden bg-card">
            <div className="p-4 border-b border-border/40 bg-muted/20 flex items-center gap-2">
              <Command className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                Quick Presets
              </span>
            </div>
            <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar max-h-[400px]">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setPreset(preset.val)}
                  className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-all group flex items-start gap-3 border border-transparent hover:border-border/50"
                >
                  <div className="mt-0.5 p-2 bg-background border border-border rounded-md text-muted-foreground group-hover:text-primary group-hover:border-primary/30 transition-colors">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {preset.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">
                      {preset.desc}
                    </div>
                    <code className="text-[10px] text-muted-foreground/60 font-mono mt-1 block opacity-0 group-hover:opacity-100 transition-opacity">
                      {preset.val}
                    </code>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-foreground/50 self-center" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
