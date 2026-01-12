import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { StringInspectorTool } from "@/tools/StringInspectorTool";

export const metadata: Metadata = toolMetadata({
  title: "String Inspector",
  description:
    "Inspect Unicode text accurately: graphemes, code points, code units, bytes, and invisible characters.",
  path: "/string-inspector",
  keywords: [
    "string inspector",
    "unicode inspector",
    "text analyzer",
    "character counter",
    "code points",
    "grapheme clusters",
    "string analyzer",
  ],
});

export default function StringInspectorPage() {
  return <StringInspectorTool />;
}
