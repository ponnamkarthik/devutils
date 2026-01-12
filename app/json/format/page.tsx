import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonTool } from "@/tools/JsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Formatter",
  description:
    "Format and beautify JSON with proper indentation. Validate and copy clean JSON instantly.",
  path: "/json/format",
  keywords: [
    "json formatter",
    "json beautifier",
    "format json",
    "pretty print json",
    "json pretty print",
    "json lint",
    "beautify json",
  ],
});

export default function JsonFormatterPage() {
  return <JsonTool mode="format" />;
}
