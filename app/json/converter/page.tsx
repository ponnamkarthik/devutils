import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonConverterTool } from "@/tools/JsonConverterTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Converter",
  description:
    "Generate types/schemas from JSON: TypeScript, Zod, Go, Java, Kotlin, Rust, Dart (incl. Freezed), Python, C#, Swift, C++, Objective-C, PHP, Ruby, Scala, and JSON Schema.",
  path: "/json/converter",
  keywords: [
    "json converter",
    "json transform",
    "convert json",
    "json tools",
    "json mapper",
    "api tools",
  ],
});

export default function JsonConverterPage() {
  return <JsonConverterTool />;
}
