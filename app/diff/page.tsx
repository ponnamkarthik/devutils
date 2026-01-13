import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { DiffViewerTool } from "@/tools/DiffViewerTool";

export const metadata: Metadata = toolMetadata({
  title: "Diff Viewer",
  description:
    "Compare two text blocks with a side-by-side diff, syntax highlighting, and quick actions like swap and clear.",
  path: "/diff",
  keywords: [
    "diff viewer",
    "text diff",
    "compare text",
    "side by side diff",
    "diff checker",
    "string diff",
    "code diff",
  ],
});

export default function DiffPage() {
  return <DiffViewerTool />;
}
