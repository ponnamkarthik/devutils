"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export const JsonTreeItem: React.FC<{
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

    const valDisplay =
      typeof value === "string" ? `\"${value}\"` : String(value);

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
