import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CodeMinifierTool } from "@/tools/CodeMinifierTool";

export const metadata: Metadata = toolMetadata({
  title: "Code Minifier",
  description:
    "Minify and compress code for faster loading. Reduce file size for JavaScript, CSS, HTML, and more.",
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
