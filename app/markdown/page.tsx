import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { MarkdownTool } from "@/tools/MarkdownTool";

export const metadata: Metadata = toolMetadata({
  title: "Markdown Preview",
  description:
    "Preview and edit Markdown with live rendering. Great for READMEs, docs, and notes.",
  path: "/markdown",
  keywords: [
    "markdown preview",
    "markdown editor",
    "markdown viewer",
    "markdown to html",
    "md preview",
    "markdown renderer",
    "md",
  ],
});

export default function MarkdownPage() {
  return <MarkdownTool />;
}
