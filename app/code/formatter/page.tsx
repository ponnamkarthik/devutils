import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CodeFormatterTool } from "@/tools/CodeFormatterTool";

export const metadata: Metadata = toolMetadata({
  title: "Code Formatter",
  description:
    "Format code with Prettier: JavaScript, TypeScript, JSON, HTML, CSS/SCSS, Markdown, YAML, and GraphQL (configurable options).",
  path: "/code/formatter",
  keywords: [
    "code formatter",
    "prettier",
    "beautify code",
    "format javascript",
    "format typescript",
    "format html",
    "format css",
  ],
});

export default function CodeFormatterPage() {
  return <CodeFormatterTool />;
}
