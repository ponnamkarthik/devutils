import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CodeFormatterTool } from "@/tools/CodeFormatterTool";

export const metadata: Metadata = toolMetadata({
  title: "Code Formatter",
  description:
    "Format and beautify code (JavaScript, TypeScript, HTML, CSS, and more) with consistent styling.",
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
