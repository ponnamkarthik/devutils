import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { MarkdownTool } from "@/tools/MarkdownTool";

export const metadata: Metadata = toolMetadata({
  title: "Markdown Preview",
  description:
    "Live GitHub-flavored Markdown preview with export to HTML and print-friendly output. Great for READMEs and docs.",
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
