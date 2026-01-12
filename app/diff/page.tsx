import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { DiffViewerTool } from "@/tools/DiffViewerTool";

export const metadata: Metadata = toolMetadata({
  title: "Diff Viewer",
  description:
    "Compare text side-by-side and highlight differences. Great for code reviews and config diffs.",
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
