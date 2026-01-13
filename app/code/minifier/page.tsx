import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CodeMinifierTool } from "@/tools/CodeMinifierTool";

export const metadata: Metadata = toolMetadata({
  title: "Code Minifier",
  description:
    "Minify JavaScript, CSS, and HTML by removing comments and collapsing whitespace. Includes size stats and copy output.",
  path: "/code/minifier",
  keywords: [
    "code minifier",
    "minify code",
    "minify javascript",
    "minify js",
    "minify css",
    "minify html",
    "uglify code",
  ],
});

export default function CodeMinifierPage() {
  return <CodeMinifierTool />;
}
