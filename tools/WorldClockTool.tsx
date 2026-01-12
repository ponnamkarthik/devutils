"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "../components/UI";
import {
  Globe,
  Plus,
  X,
  Search,
  Calendar as CalendarIcon,
  MapPin,
  Briefcase,
  ArrowUp,
  ArrowDown,
  Clock,
  Trash2,
  Building2,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface LocationEntry {
  id: string;
  zone: string; // IANA Timezone ID (e.g., 'Asia/Kolkata')
  name: string; // Display Name (e.g., 'Hyderabad' or 'PST')
  subtext: string; // Subtitle (e.g., 'India' or 'Pacific Standard Time')
  offsetLabel?: string; // Cached offset label
  type: "city" | "zone";
}

const CITY_MAPPING: Record<string, { zone: string; country: string }> = {
  hyderabad: { zone: "Asia/Kolkata", country: "India" },
  bangalore: { zone: "Asia/Kolkata", country: "India" },
  mumbai: { zone: "Asia/Kolkata", country: "India" },
  delhi: { zone: "Asia/Kolkata", country: "India" },
  "san francisco": { zone: "America/Los_Angeles", country: "USA" },
  "new york": { zone: "America/New_York", country: "USA" },
  london: { zone: "Europe/London", country: "UK" },
  dubai: { zone: "Asia/Dubai", country: "UAE" },
  singapore: { zone: "Asia/Singapore", country: "Singapore" },
  tokyo: { zone: "Asia/Tokyo", country: "Japan" },
  sydney: { zone: "Australia/Sydney", country: "Australia" },
  berlin: { zone: "Europe/Berlin", country: "Germany" },
  paris: { zone: "Europe/Paris", country: "France" },
  toronto: { zone: "America/Toronto", country: "Canada" },
  beijing: { zone: "Asia/Shanghai", country: "China" },
  seoul: { zone: "Asia/Seoul", country: "South Korea" },
  moscow: { zone: "Europe/Moscow", country: "Russia" },
  "sao paulo": { zone: "America/Sao_Paulo", country: "Brazil" },
};

const TIMEZONE_ALIASES: Record<string, { zones: string[]; name: string }> = {
  ist: { zones: ["Asia/Kolkata"], name: "India Standard Time" },
  pst: { zones: ["America/Los_Angeles"], name: "Pacific Standard Time" },
  pdt: { zones: ["America/Los_Angeles"], name: "Pacific Daylight Time" },
  est: { zones: ["America/New_York"], name: "Eastern Standard Time" },
  edt: { zones: ["America/New_York"], name: "Eastern Daylight Time" },
  cst: { zones: ["America/Chicago"], name: "Central Standard Time" },
  gmt: { zones: ["Europe/London"], name: "Greenwich Mean Time" },
  bst: { zones: ["Europe/London"], name: "British Summer Time" },
  cet: { zones: ["Europe/Paris"], name: "Central European Time" },
  jst: { zones: ["Asia/Tokyo"], name: "Japan Standard Time" },
  utc: { zones: ["UTC"], name: "Coordinated Universal Time" },
};

const getOffset = (date: Date, timeZone: string) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(date);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";
    return offset.replace("GMT", "");
  } catch {
    return "";
  }
};

const getAbbr = (date: Date, timeZone: string) => {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    }).formatToParts(date);
    const abbr = parts.find((p) => p.type === "timeZoneName")?.value || "";
    return abbr;
  } catch {
    return "";
  }
};

const formatTimeShort = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone,
  }).format(date);
};

const formatDayShort = (date: Date, timeZone: string) => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    timeZone,
  }).format(date);
};

export const WorldClockTool: React.FC = () => {
  const [locations, setLocations] = useState<LocationEntry[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const init = async () => {
      if (locations.length > 0) return;

      const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const initialLocs: LocationEntry[] = [];

      initialLocs.push({
        id: uuidv4(),
        zone: localTz,
        name: "Home",
        subtext: localTz.split("/")[1]?.replace(/_/g, " ") || localTz,
        type: "city",
      });

      if (localTz !== "UTC") {
        initialLocs.push({
          id: uuidv4(),
          zone: "UTC",
          name: "UTC",
          subtext: "Universal Time",
          type: "zone",
        });
      }

      if (!localTz.includes("London")) {
        initialLocs.push({
          id: uuidv4(),
          zone: "Europe/London",
          name: "London",
          subtext: "United Kingdom",
          type: "city",
        });
      }

      setLocations(initialLocs);
    };
    init();
  }, []);

  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase().trim();
    const results: {
      zone: string;
      name: string;
      subtext: string;
      type: "city" | "zone";
    }[] = [];

    Object.entries(CITY_MAPPING).forEach(([city, data]) => {
      if (city.includes(q)) {
        const displayCity =
          city.charAt(0).toUpperCase() +
          city.slice(1).replace(/\b\w/g, (l) => l.toUpperCase());
        results.push({
          zone: data.zone,
          name: displayCity,
          subtext: data.country,
          type: "city",
        });
      }
    });

    Object.entries(TIMEZONE_ALIASES).forEach(([alias, data]) => {
      if (alias.includes(q)) {
        results.push({
          zone: data.zones[0],
          name: alias.toUpperCase(),
          subtext: data.name,
          type: "zone",
        });
      }
    });

    if (results.length < 5) {
      try {
        // @ts-ignore
        const allZones = Intl.supportedValuesOf("timeZone");
        allZones.forEach((z: string) => {
          if (z.toLowerCase().includes(q)) {
            if (!results.find((r) => r.zone === z)) {
              const parts = z.split("/");
              const city = parts[parts.length - 1].replace(/_/g, " ");
              results.push({
                zone: z,
                name: city,
                subtext: parts[0],
                type: "city",
              });
            }
          }
        });
      } catch (e) {}
    }

    return results.slice(0, 8);
  }, [searchQuery]);

  const addLocation = (item: {
    zone: string;
    name: string;
    subtext: string;
    type: "city" | "zone";
  }) => {
    const exists = locations.find((l) => l.zone === item.zone);
    if (exists) {
    }

    setLocations([...locations, { ...item, id: uuidv4() }]);
    setIsSearching(false);
    setSearchQuery("");
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter((l) => l.id !== id));
  };

  const moveLocation = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === locations.length - 1) return;

    const newLocs = [...locations];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newLocs[swapIndex], newLocs[index]] = [newLocs[index], newLocs[swapIndex]];
    setLocations(newLocs);
  };

  const homeTz = locations[0]?.zone || "UTC";

  // Find the exact UTC timestamp for 00:00 of the selected date in Home TZ
  const startOfHomeDayUTC = useMemo(() => {
    let d = new Date(`${date}T00:00:00Z`);
    let best = d;
    let minDiff = Infinity;
    for (let i = -14; i <= 14; i++) {
      const test = new Date(d.getTime() + i * 3600000);
      const parts = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: homeTz,
      }).formatToParts(test);
      const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
      const diff = Math.abs(h - 0);
      if (diff < minDiff) {
        minDiff = diff;
        best = test;
        if (diff === 0) break;
      }
    }
    return best;
  }, [date, homeTz]);

  const getSlotType = (hour: number) => {
    if (hour >= 9 && hour <= 17) return "business";
    if (hour >= 8 && hour <= 22) return "day";
    return "night";
  };

  const currentTimeIndicator = useMemo(() => {
    const now = new Date();
    const start = startOfHomeDayUTC.getTime();
    const end = start + 24 * 3600000;
    const nowTime = now.getTime();
    if (nowTime >= start && nowTime < end) {
      return (nowTime - start) / 3600000;
    }
    return null;
  }, [startOfHomeDayUTC]);

  const handleMouseEnter = (index: number) => setHoveredSlot(index);
  const handleMouseLeave = () => setHoveredSlot(null);

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-10rem)] min-h-[600px]">
      {/* --- Toolbar --- */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border/40 flex-none">
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              World Clock
            </h1>
            <p className="text-xs text-muted-foreground">
              Compare timezones and plan meetings.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-auto font-medium transition-all hover:border-primary/50"
            />
            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none group-hover:text-primary transition-colors" />
          </div>

          <div className="relative flex-1 md:w-80">
            {isSearching ? (
              <div className="absolute right-0 top-0 z-50 w-full md:w-80 bg-popover border border-border rounded-lg shadow-xl p-2 animate-in fade-in zoom-in-95 ring-1 ring-black/5">
                <div className="flex items-center gap-2 border-b border-border/50 pb-2 mb-1 px-1">
                  <Search className="h-4 w-4 text-primary" />
                  <input
                    ref={searchInputRef}
                    className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground h-8"
                    placeholder="City (e.g. London) or Zone (e.g. PST)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    onClick={() => setIsSearching(false)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar py-1">
                  {searchResults.length === 0 ? (
                    <div className="text-xs text-muted-foreground p-4 text-center">
                      {searchQuery ? "No matches found" : "Type to search..."}
                    </div>
                  ) : (
                    searchResults.map((res, idx) => (
                      <button
                        key={idx}
                        onClick={() => addLocation(res)}
                        className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-primary/10 transition-colors flex flex-col gap-0.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground group-hover:text-primary">
                            {res.name}
                          </span>
                          {res.type === "zone" && (
                            <span className="text-[10px] bg-muted px-1.5 rounded uppercase tracking-wider">
                              Zone
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {res.subtext}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-muted-foreground border-dashed hover:border-solid hover:text-foreground hover:border-primary/50"
                onClick={() => setIsSearching(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add City or Timezone
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- Main Grid Area --- */}
      <div className="flex-1 flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden relative isolate">
        {/* Legend */}
        <div className="flex justify-end gap-6 px-6 py-3 border-b border-border/40 text-xs font-medium text-muted-foreground bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
            <span>Business (9am-5pm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500/10 border border-blue-500/30"></div>
            <span>Daytime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700"></div>
            <span>Night</span>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative">
          <div className="min-w-[900px] pb-4">
            {/* Sticky Header Row */}
            <div className="sticky top-0 z-30 flex bg-background/95 backdrop-blur border-b border-border shadow-sm">
              <div className="w-64 flex-none p-4 flex items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Locations
                </span>
              </div>
              <div className="flex-1 flex relative">
                {Array.from({ length: 24 }).map((_, i) => {
                  const slotTime = new Date(
                    startOfHomeDayUTC.getTime() + i * 3600000
                  );
                  const label = new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    hour12: true,
                    timeZone: homeTz,
                  }).format(slotTime);
                  return (
                    <div
                      key={i}
                      className="flex-1 flex justify-center py-3 border-l border-border/30 first:border-l-0"
                    >
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                        {label.replace(":00", "").toLowerCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Location Rows */}
            <div
              className="relative group/grid"
              onMouseLeave={handleMouseLeave}
            >
              {/* Overlays Container (Restricted to Grid Area) */}
              <div className="absolute top-0 bottom-0 left-64 right-0 pointer-events-none z-10">
                {/* Vertical Highlight Overlay */}
                {(hoveredSlot !== null || selectedSlot !== null) && (
                  <div
                    className="absolute top-0 bottom-0 transition-all duration-150"
                    style={{
                      left: `${((selectedSlot !== null ? selectedSlot : hoveredSlot!) / 24) * 100}%`,
                      width: `${(1 / 24) * 100}%`,
                    }}
                  >
                    <div
                      className={`w-full h-full border-x-2 ${selectedSlot !== null ? "border-primary bg-primary/5" : "border-primary/30 bg-primary/5"}`}
                    ></div>
                    {selectedSlot !== null && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-40">
                        SELECTED
                      </div>
                    )}
                  </div>
                )}

                {/* Current Time Line Indicator */}
                {currentTimeIndicator !== null && (
                  <div
                    className="absolute top-0 bottom-0 z-20 border-l-2 border-red-500"
                    style={{
                      left: `${(currentTimeIndicator / 24) * 100}%`,
                    }}
                  >
                    <div className="absolute -top-1 -left-[5px] w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
                  </div>
                )}
              </div>

              {/* Data Rows */}
              {locations.map((loc, index) => {
                const isHome = index === 0;
                const now = new Date();

                // Determine offset/badge text
                const offsetStr = getOffset(now, loc.zone);
                const abbr = getAbbr(now, loc.zone);

                const badgeText =
                  loc.type === "zone" && loc.name !== abbr ? abbr : offsetStr;

                // Time Display for Card
                const timeDisplay = formatTimeShort(now, loc.zone);
                const dateDisplay = formatDayShort(now, loc.zone);

                return (
                  <div
                    key={loc.id}
                    className="flex border-b border-border/30 hover:bg-muted/10 transition-colors relative group/row"
                  >
                    {/* Left Card: Info - REDESIGNED */}
                    <div
                      className={`w-64 flex-none p-3 px-5 flex flex-col justify-center relative border-r border-border/30 z-20 ${isHome ? "bg-primary/5" : "bg-card"}`}
                    >
                      {/* Highlight Bar for Home */}
                      {isHome && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      )}

                      <div className="flex items-baseline justify-between w-full mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {isHome && (
                            <MapPin className="h-4 w-4 text-primary fill-primary/20 shrink-0" />
                          )}
                          <span className="font-bold text-lg truncate text-foreground">
                            {loc.name}
                          </span>
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 rounded-sm whitespace-nowrap">
                            {loc.type === "zone" && loc.name !== abbr
                              ? `${loc.name}/${abbr}`
                              : abbr || offsetStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs text-muted-foreground truncate max-w-[120px]"
                          title={loc.subtext}
                        >
                          {loc.subtext}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/30">
                        <span className="text-sm font-mono font-bold text-foreground">
                          {timeDisplay}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {dateDisplay}
                        </span>
                      </div>

                      {/* Hover Actions */}
                      <div className="absolute -left-1 top-0 bottom-0 w-8 flex flex-col items-center justify-center gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity bg-gradient-to-r from-background to-transparent">
                        {!isHome && (
                          <>
                            <button
                              onClick={() => moveLocation(index, "up")}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveLocation(index, "down")}
                              className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeLocation(loc.id)}
                              className="p-1 hover:bg-red-100 text-muted-foreground hover:text-red-500 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right Bar: Time Slots */}
                    <div className="flex-1 flex relative">
                      {Array.from({ length: 24 }).map((_, i) => {
                        const slotTime = new Date(
                          startOfHomeDayUTC.getTime() + i * 3600000
                        );
                        const parts = new Intl.DateTimeFormat("en-US", {
                          hour: "numeric",
                          hour12: false,
                          timeZone: loc.zone,
                        }).formatToParts(slotTime);
                        const localHour = parseInt(
                          parts.find((p) => p.type === "hour")?.value || "0"
                        );

                        const type = getSlotType(localHour);
                        const isSelected = selectedSlot === i;

                        let bgClass = "";
                        let textClass = "";

                        if (type === "business") {
                          bgClass = "bg-emerald-500/15 border-emerald-500/20";
                          textClass =
                            "text-emerald-700 dark:text-emerald-400 font-medium";
                        } else if (type === "day") {
                          bgClass = "bg-blue-500/5 border-blue-500/10";
                          textClass = "text-blue-600 dark:text-blue-300";
                        } else {
                          bgClass =
                            "bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800";
                          textClass = "text-slate-400 dark:text-slate-600";
                        }

                        return (
                          <div
                            key={i}
                            onMouseEnter={() => handleMouseEnter(i)}
                            onClick={() =>
                              setSelectedSlot(i === selectedSlot ? null : i)
                            }
                            className={`
                                                    flex-1 h-16 border-r last:border-r-0 cursor-pointer relative flex items-center justify-center transition-all group/cell
                                                    ${bgClass}
                                                    ${isSelected ? "ring-inset ring-2 ring-primary z-10" : "border-transparent"}
                                                `}
                          >
                            <span
                              className={`text-xs ${textClass} ${isSelected ? "font-bold scale-110" : ""}`}
                            >
                              {localHour}
                            </span>

                            {localHour === 0 && (
                              <span className="absolute bottom-1 right-1 text-[8px] font-bold text-foreground/50 uppercase tracking-tighter leading-none">
                                {formatDayShort(slotTime, loc.zone)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- Footer Summary --- */}
        {selectedSlot !== null && (
          <div className="flex-none bg-background/95 backdrop-blur-md border-t border-primary/20 p-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-5 z-40 max-h-[40vh] overflow-y-auto">
            <div className="w-full px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wide">
                      Proposed Time
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Coordinates across all locations
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSlot(null)}
                  className="h-8 hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4 mr-1" /> Close
                </Button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {locations.map((loc) => {
                  const slotTime = new Date(
                    startOfHomeDayUTC.getTime() + selectedSlot * 3600000
                  );
                  const timeStr = new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    timeZone: loc.zone,
                  }).format(slotTime);
                  const dateStr = new Intl.DateTimeFormat("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    timeZone: loc.zone,
                  }).format(slotTime);

                  const parts = new Intl.DateTimeFormat("en-US", {
                    hour: "numeric",
                    hour12: false,
                    timeZone: loc.zone,
                  }).formatToParts(slotTime);
                  const h = parseInt(
                    parts.find((p) => p.type === "hour")?.value || "0"
                  );
                  const isBusiness = h >= 9 && h <= 17;

                  return (
                    <div
                      key={loc.id}
                      className={`p-3 rounded-lg border ${isBusiness ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"} flex flex-col`}
                    >
                      <span className="text-xs font-semibold text-muted-foreground truncate mb-1">
                        {loc.name}
                      </span>
                      <span
                        className={`text-lg font-bold ${isBusiness ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}
                      >
                        {timeStr}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
