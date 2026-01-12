import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonConverterTool } from "@/tools/JsonConverterTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Converter",
  description:
    "Convert and transform JSON quickly. Helpful for working with APIs and data structures.",
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
