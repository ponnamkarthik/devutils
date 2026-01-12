import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonTool } from "@/tools/JsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Minifier",
  description:
    "Minify JSON by removing whitespace to reduce payload size. Great for production API responses.",
  path: "/json/minify",
  keywords: [
    "json minifier",
    "minify json",
    "compact json",
    "remove whitespace json",
    "json compressor",
    "minify json online",
  ],
});

export default function JsonMinifyPage() {
  return <JsonTool mode="minify" />;
}
