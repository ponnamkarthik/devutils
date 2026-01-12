import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonTreeTool } from "@/tools/JsonTreeTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Graph Viewer",
  description:
    "Visualize JSON as an interactive graph/tree to understand relationships and nested structures.",
  path: "/json/graph",
  keywords: [
    "json graph",
    "json viewer",
    "json visualization",
    "json tree",
    "json explorer",
    "json diagram",
  ],
});

export default function JsonGraphPage() {
  return <JsonTreeTool />;
}
