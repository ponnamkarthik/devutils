"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button, Card } from "../components/UI";
import { MonacoEditor } from "../components/MonacoEditor";
import { JsonTreeItem } from "../components/JsonTreeView";
import {
  FileCode,
  Play,
  Copy,
  Check,
  Eraser,
  Settings2,
  FileType,
  ListTree,
} from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Language =
  | "typescript"
  | "zod"
  | "go"
  | "java"
  | "kotlin"
  | "rust"
  | "dart"
  | "dart-freezed"
  | "python"
  | "csharp"
  | "swift"
  | "cpp"
  | "objective-c"
  | "php"
  | "ruby"
  | "scala"
  | "json-schema";

interface Property {
  key: string;
  type: string;
  nativeType: string;
  isArray: boolean;
  isOptional: boolean;
  nestedType?: string;
}

interface ClassDefinition {
  name: string;
  properties: Property[];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const camelCase = (s: string) =>
  s.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
const pascalCase = (s: string) => capitalize(camelCase(s));
const snakeCase = (s: string) =>
  s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`).replace(/^_/, "");

class SchemaGenerator {
  classes: Map<string, ClassDefinition> = new Map();

  generate(json: any, rootName: string, lang: Language): string {
    this.classes.clear();

    // JSON Schema is handled differently (recursive object generation)
    if (lang === "json-schema") {
      return JSON.stringify(this.generateJsonSchema(json, rootName), null, 2);
    }

    this.parseObject(json, rootName, lang);
    return this.render(lang);
  }

  private generateJsonSchema(obj: any, title: string): any {
    const schema: any = {
      type: typeof obj,
      title: title,
    };

    if (obj === null) return { type: "null" };

    if (Array.isArray(obj)) {
      schema.type = "array";
      if (obj.length > 0) {
        schema.items = this.generateJsonSchema(obj[0], title + "Item");
      } else {
        schema.items = {};
      }
      return schema;
    }

    if (typeof obj === "object") {
      schema.type = "object";
      schema.properties = {};
      schema.required = [];

      Object.entries(obj).forEach(([key, value]) => {
        schema.properties[key] = this.generateJsonSchema(
          value,
          pascalCase(key)
        );
        schema.required.push(key);
      });
      return schema;
    }

    return schema;
  }

  private getNativeType(
    type: string,
    lang: Language,
    nestedName?: string
  ): string {
    switch (lang) {
      case "typescript":
      case "zod":
        if (type === "string") return "string";
        if (type === "number") return "number";
        if (type === "boolean") return "boolean";
        if (type === "object") return nestedName || "any";
        return "any";
      case "go":
        if (type === "string") return "string";
        if (type === "number") return "float64";
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "interface{}";
        return "interface{}";
      case "java":
        if (type === "string") return "String";
        if (type === "number") return "double";
        if (type === "boolean") return "boolean";
        if (type === "object") return nestedName || "Object";
        return "Object";
      case "kotlin":
        if (type === "string") return "String";
        if (type === "number") return "Double";
        if (type === "boolean") return "Boolean";
        if (type === "object") return nestedName || "Any";
        return "Any";
      case "rust":
        if (type === "string") return "String";
        if (type === "number") return "f64";
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "serde_json::Value";
        return "serde_json::Value";
      case "dart":
      case "dart-freezed":
        if (type === "string") return "String";
        if (type === "number") return "num"; // num handles both int and double
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "Map<String, dynamic>";
        return "dynamic";
      case "python":
        if (type === "string") return "str";
        if (type === "number") return "float";
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "Dict";
        return "Any";
      case "csharp":
        if (type === "string") return "string";
        if (type === "number") return "double";
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "object";
        return "object";
      case "swift":
        if (type === "string") return "String";
        if (type === "number") return "Double";
        if (type === "boolean") return "Bool";
        if (type === "object") return nestedName || "Any";
        return "Any";
      case "cpp":
        if (type === "string") return "std::string";
        if (type === "number") return "double";
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "nlohmann::json";
        return "nlohmann::json";
      case "objective-c":
        if (type === "string") return "NSString *";
        if (type === "number") return "NSNumber *";
        if (type === "boolean") return "BOOL "; // Space intentional for pointer logic
        if (type === "object") return `${nestedName} *` || "NSDictionary *";
        return "id ";
      case "php":
        // PHP 7.4+ type hints
        if (type === "string") return "string";
        if (type === "number") return "float";
        if (type === "boolean") return "bool";
        if (type === "object") return nestedName || "object";
        return "mixed";
      case "ruby":
        // Ruby doesn't really have type annotations in the same way, usually mostly dynamic
        return "";
      case "scala":
        if (type === "string") return "String";
        if (type === "number") return "Double";
        if (type === "boolean") return "Boolean";
        if (type === "object") return nestedName || "Any";
        return "Any";
      default:
        return "any";
    }
  }

  private parseObject(obj: any, className: string, lang: Language): string {
    if (obj === null) return this.getNativeType("null", lang);
    if (typeof obj !== "object") return this.getNativeType(typeof obj, lang);

    if (Array.isArray(obj)) {
      if (obj.length === 0) return this.getNativeType("object", lang);
      const firstItem = obj[0];
      if (typeof firstItem === "object" && firstItem !== null) {
        return this.parseObject(firstItem, className + "Item", lang);
      }
      return this.getNativeType(typeof firstItem, lang);
    }

    const definition: ClassDefinition = { name: className, properties: [] };

    for (const [key, value] of Object.entries(obj)) {
      let type: string = typeof value;
      let isArray = false;
      let nestedType: string | undefined = undefined;
      let nativeType = "any";

      if (value === null) {
        type = "null";
        nativeType = this.getNativeType("object", lang);
      } else if (Array.isArray(value)) {
        type = "array";
        isArray = true;
        if (value.length > 0) {
          const item = value[0];
          const itemType = typeof item;
          if (itemType === "object" && item !== null) {
            nestedType = this.parseObject(item, pascalCase(key), lang);
            nativeType = nestedType;
          } else {
            nativeType = this.getNativeType(itemType, lang);
          }
        } else {
          nativeType = this.getNativeType("object", lang);
        }
      } else if (type === "object") {
        nestedType = this.parseObject(value, pascalCase(key), lang);
        nativeType = nestedType;
      } else {
        nativeType = this.getNativeType(type, lang);
      }

      definition.properties.push({
        key,
        type,
        nativeType,
        isArray,
        isOptional: value === null,
        nestedType,
      });
    }

    this.classes.set(className, definition);
    return className;
  }

  private render(lang: Language): string {
    const definitions = Array.from(this.classes.values()).reverse();
    let code = "";

    switch (lang) {
      case "typescript":
        code = definitions
          .map((def) => {
            const props = def.properties
              .map(
                (p) =>
                  `  ${p.key}${p.isOptional ? "?" : ""}: ${p.nativeType}${p.isArray ? "[]" : ""};`
              )
              .join("\n");
            return `export interface ${def.name} {\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "zod":
        code = "import { z } from 'zod';\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                let zodType = "z.any()";
                if (p.nativeType === "string") zodType = "z.string()";
                else if (p.nativeType === "number") zodType = "z.number()";
                else if (p.nativeType === "boolean") zodType = "z.boolean()";
                else if (p.nestedType) zodType = `${p.nestedType}Schema`;

                if (p.isArray) zodType = `z.array(${zodType})`;
                if (p.isOptional) zodType += ".optional()";

                return `  ${p.key}: ${zodType},`;
              })
              .join("\n");
            return `export const ${def.name}Schema = z.object({\n${props}\n});\nexport type ${def.name} = z.infer<typeof ${def.name}Schema>;`;
          })
          .join("\n\n");
        break;

      case "go":
        code = definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const fieldName = pascalCase(p.key);
                const type = p.isArray ? `[]${p.nativeType}` : p.nativeType;
                return `  ${fieldName} ${type} \`json:"${p.key}"\``;
              })
              .join("\n");
            return `type ${def.name} struct {\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "rust":
        code += "use serde::{Deserialize, Serialize};\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const fieldName = snakeCase(p.key);
                let type = p.nativeType;
                if (type === "float64") type = "f64";

                const isVec = p.isArray ? `Vec<${type}>` : type;
                const isOption = p.isOptional ? `Option<${isVec}>` : isVec;

                return `    #[serde(rename = "${p.key}")]\n    pub ${fieldName}: ${isOption},`;
              })
              .join("\n");
            return `#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]\n#[serde(rename_all = "camelCase")]\npub struct ${def.name} {\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "java":
        code +=
          "import com.fasterxml.jackson.annotation.JsonProperty;\nimport java.util.List;\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                let type = p.isArray ? `List<${p.nativeType}>` : p.nativeType;
                if (p.isArray && type.includes("double")) type = "List<Double>";
                if (p.isArray && type.includes("boolean"))
                  type = "List<Boolean>";

                return `    @JsonProperty("${p.key}")\n    public ${type} ${camelCase(p.key)};`;
              })
              .join("\n\n");
            return `public class ${def.name} {\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "kotlin":
        code +=
          "import kotlinx.serialization.Serializable\nimport kotlinx.serialization.SerialName\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                let type = p.isArray ? `List<${p.nativeType}>` : p.nativeType;
                const nullable = p.isOptional ? "?" : "";
                return `    @SerialName("${p.key}")\n    val ${camelCase(p.key)}: ${type}${nullable}`;
              })
              .join(",\n");
            return `@Serializable\ndata class ${def.name}(\n${props}\n)`;
          })
          .join("\n\n");
        break;

      case "dart":
        code = definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? `List<${p.nativeType}>` : p.nativeType;
                return `  final ${type}${p.isOptional ? "?" : ""} ${camelCase(p.key)};`;
              })
              .join("\n");

            const constructorParams = def.properties
              .map((p) => {
                return `    ${p.isOptional ? "" : "required "}this.${camelCase(p.key)},`;
              })
              .join("\n");

            return `class ${def.name} {\n${props}\n\n  ${def.name}({\n${constructorParams}\n  });\n\n  factory ${def.name}.fromJson(Map<String, dynamic> json) {\n    return ${def.name}(\n      // Implement fromJson mapping here\n    );\n  }\n}`;
          })
          .join("\n\n");
        break;

      case "dart-freezed":
        const fileName = snakeCase(
          definitions[0]?.name || "model"
        ).toLowerCase();
        code =
          "import 'package:freezed_annotation/freezed_annotation.dart';\nimport 'package:flutter/foundation.dart';\n\n";
        code += `part '${fileName}.freezed.dart';\n`;
        code += `part '${fileName}.g.dart';\n\n`;

        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? `List<${p.nativeType}>` : p.nativeType;
                const required = p.isOptional ? "" : "required ";
                const nullable = p.isOptional ? "?" : "";
                const keyAnnotation =
                  p.key !== camelCase(p.key)
                    ? `    @JsonKey(name: "${p.key}")\n`
                    : "";

                return `${keyAnnotation}    ${required}${type}${nullable} ${camelCase(p.key)},`;
              })
              .join("\n");

            return `@freezed\nclass ${def.name} with _$${def.name} {\n  const factory ${def.name}({\n${props}\n  }) = _${def.name};\n\n  factory ${def.name}.fromJson(Map<String, Object?> json) => _$${def.name}FromJson(json);\n}`;
          })
          .join("\n\n");
        break;

      case "python":
        code +=
          "from typing import List, Any, Optional\nfrom pydantic import BaseModel, Field\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? `List[${p.nativeType}]` : p.nativeType;
                return `    ${snakeCase(p.key)}: ${p.isOptional ? `Optional[${type}]` : type} = Field(alias="${p.key}")`;
              })
              .join("\n");
            return `class ${def.name}(BaseModel):\n${props || "    pass"}`;
          })
          .join("\n\n");
        break;

      case "csharp":
        code +=
          "using System.Text.Json.Serialization;\nusing System.Collections.Generic;\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                let type = p.isArray ? `List<${p.nativeType}>` : p.nativeType;
                return `    [JsonPropertyName("${p.key}")]\n    public ${type} ${pascalCase(p.key)} { get; set; }`;
              })
              .join("\n\n");
            return `public class ${def.name}\n{\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "swift":
        code = "import Foundation\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? `[${p.nativeType}]` : p.nativeType;
                return `    let ${camelCase(p.key)}: ${type}${p.isOptional ? "?" : ""}`;
              })
              .join("\n");
            return `struct ${def.name}: Codable {\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "cpp":
        code =
          "#include <nlohmann/json.hpp>\n#include <optional>\n#include <vector>\n#include <string>\n\nusing nlohmann::json;\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray
                  ? `std::vector<${p.nativeType}>`
                  : p.nativeType;
                const finalType = p.isOptional
                  ? `std::optional<${type}>`
                  : type;
                return `    ${finalType} ${snakeCase(p.key)};`;
              })
              .join("\n");

            const macroArgs = def.properties
              .map((p) => snakeCase(p.key))
              .join(", ");

            return `struct ${def.name} {\n${props}\n};\n\nNLOHMANN_DEFINE_TYPE_NON_INTRUSIVE(${def.name}, ${macroArgs})`;
          })
          .join("\n\n");
        break;

      case "objective-c":
        code = "#import <Foundation/Foundation.h>\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? "NSArray *" : p.nativeType;
                const modifier =
                  type.includes("*") || type === "id " ? "strong" : "assign";
                return `@property (nonatomic, ${modifier}) ${type}${camelCase(p.key)};`;
              })
              .join("\n");
            return `@interface ${def.name} : NSObject\n${props}\n@end`;
          })
          .join("\n\n");
        break;

      case "php":
        code = definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? "array" : p.nativeType;
                const nullable = p.isOptional ? "?" : "";
                return `    public ${nullable}${type} $${camelCase(p.key)};`;
              })
              .join("\n");
            return `class ${def.name} {\n${props}\n}`;
          })
          .join("\n\n");
        break;

      case "ruby":
        code = "require 'json'\n\n";
        code += definitions
          .map((def) => {
            const attrs = def.properties
              .map((p) => `:${snakeCase(p.key)}`)
              .join(", ");
            return `class ${def.name}\n  attr_accessor ${attrs}\n\n  def self.from_json(json)\n    # Implementation needed\n  end\nend`;
          })
          .join("\n\n");
        break;

      case "scala":
        code += "import upickle.default.{ReadWriter => RW, macroRW}\n\n";
        code += definitions
          .map((def) => {
            const props = def.properties
              .map((p) => {
                const type = p.isArray ? `List[${p.nativeType}]` : p.nativeType;
                const finalType = p.isOptional ? `Option[${type}]` : type;
                return `  ${camelCase(p.key)}: ${finalType}`;
              })
              .join(",\n");
            return `case class ${def.name}(\n${props}\n)\n\nobject ${def.name} {\n  implicit val rw: RW[${def.name}] = macroRW\n}`;
          })
          .join("\n\n");
        break;
    }

    return code;
  }
}

export const JsonConverterTool: React.FC = () => {
  const [input, setInput] = useLocalStorage<string>(
    "devutils-json-convert-input",
    '{\n  "id": 1,\n  "username": "DevUtils",\n  "isActive": true,\n  "roles": ["Admin", "User"],\n  "settings": {\n    "theme": "dark",\n    "notifications": true\n  }\n}'
  );
  const [output, setOutput] = useState("");
  const [parsedData, setParsedData] = useState<any>(null);
  const [language, setLanguage] = useLocalStorage<Language>(
    "devutils-json-convert-lang",
    "typescript"
  );
  const [rootName, setRootName] = useLocalStorage<string>(
    "devutils-json-convert-root",
    "Root"
  );
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"types" | "tree">("types");

  const handleConvert = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput("");
        setParsedData(null);
        return;
      }
      const json = JSON.parse(input);
      setParsedData(json);
      const generator = new SchemaGenerator();
      const code = generator.generate(json, rootName, language);
      setOutput(code);
      setError(null);
    } catch (e: any) {
      setError(e.message || "Invalid JSON");
      setParsedData(null);
    }
  }, [input, language, rootName]);

  // Auto convert on changes
  useEffect(() => {
    const timer = setTimeout(handleConvert, 500);
    return () => clearTimeout(timer);
  }, [handleConvert]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMonacoLanguage = (lang: Language) => {
    switch (lang) {
      case "zod":
        return "typescript";
      case "json-schema":
        return "json";
      case "objective-c":
        return "objective-c";
      case "cpp":
        return "cpp";
      case "csharp":
        return "csharp";
      case "java":
        return "java";
      case "kotlin":
        return "kotlin";
      case "rust":
        return "rust";
      case "go":
        return "go";
      case "python":
        return "python";
      case "dart":
        return "dart";
      case "dart-freezed":
        return "dart";
      case "php":
        return "php";
      case "ruby":
        return "ruby";
      case "scala":
        return "scala";
      case "swift":
        return "swift";
      default:
        return "typescript";
    }
  };

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-10rem)] min-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-pink-500/10 text-pink-500 rounded-lg">
            <FileType className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              JSON to Types
            </h1>
            <p className="text-xs text-muted-foreground">
              Instantly generate interfaces, structs, and classes from JSON.
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-2 rounded-lg border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring font-medium"
          >
            <optgroup label="JavaScript / TypeScript">
              <option value="typescript">TypeScript</option>
              <option value="zod">TypeScript (Zod)</option>
              <option value="json-schema">JSON Schema</option>
            </optgroup>
            <optgroup label="Mobile">
              <option value="swift">Swift (Codable)</option>
              <option value="kotlin">Kotlin (Serialization)</option>
              <option value="dart">Dart</option>
              <option value="dart-freezed">Dart (Freezed)</option>
              <option value="objective-c">Objective-C</option>
            </optgroup>
            <optgroup label="Backend / Systems">
              <option value="go">Go</option>
              <option value="rust">Rust (Serde)</option>
              <option value="java">Java (Jackson)</option>
              <option value="csharp">C# (System.Text.Json)</option>
              <option value="python">Python (Pydantic)</option>
              <option value="cpp">C++ (nlohmann/json)</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="scala">Scala</option>
            </optgroup>
          </select>

          <div className="flex items-center gap-1.5 border border-input rounded-md px-2 bg-background h-9">
            <span className="text-xs text-muted-foreground font-medium">
              Root Name:
            </span>
            <input
              type="text"
              value={rootName}
              onChange={(e) => setRootName(e.target.value)}
              className="w-24 bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <Button onClick={handleConvert} size="sm" className="min-w-[100px]">
            <Settings2 className="mr-2 h-4 w-4" /> Generate
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setInput("");
              setOutput("");
              setError(null);
              setParsedData(null);
            }}
            variant="destructive"
            size="sm"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card">
          <MonacoEditor
            label="JSON Input"
            value={input}
            onChange={setInput}
            language="json"
            className="border-none"
          />
        </Card>

        <Card className="flex flex-col p-0 h-full border-border/60 shadow-sm bg-card relative overflow-hidden">
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/20 flex-none bg-muted/20">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {view === "types"
                    ? `${language === "csharp" ? "C#" : capitalize(language)} Output`
                    : "Tree View"}
                </span>
                {view === "types" && (
                  <span className="text-[10px] uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                    Read-only
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-muted p-1 rounded-lg">
                  <button
                    onClick={() => setView("types")}
                    className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md transition-all ${view === "types" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <FileCode className="h-3.5 w-3.5" /> Types
                  </button>
                  <button
                    onClick={() => setView("tree")}
                    className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md transition-all ${view === "tree" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <ListTree className="h-3.5 w-3.5" /> Tree
                  </button>
                </div>

                {view === "types" && (
                  <Button
                    onClick={copyToClipboard}
                    variant="ghost"
                    size="sm"
                    disabled={!output}
                    className="h-6 px-2 text-xs hover:bg-background border border-transparent hover:border-border"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 mr-1 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
            </div>

            <div className={`flex-1 min-h-0 ${error ? "opacity-50" : ""}`}>
              {view === "types" ? (
                <MonacoEditor
                  value={output}
                  readOnly
                  language={getMonacoLanguage(language)}
                  className="border-none"
                />
              ) : (
                <div className="flex-1 overflow-auto p-4 bg-background">
                  {parsedData ? (
                    <JsonTreeItem value={parsedData} isLast={true} />
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Enter valid JSON to preview the tree.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-800 flex items-start animate-in slide-in-from-bottom-2 z-10">
              <span className="font-mono break-all">{error}</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
