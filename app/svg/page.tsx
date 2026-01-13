import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { SvgTool } from "@/tools/SVGTool";

export const metadata: Metadata = toolMetadata({
  title: "SVG Editor",
  description:
    "View and edit SVG code locally: format (Prettier), minify, resize, flip/scale/translate, preview on different backgrounds, and export.",
  path: "/svg",
  keywords: [
    "svg editor",
    "svg viewer",
    "svg optimizer",
    "svg formatter",
    "svg minifier",
  ],
});

export default function SvgPage() {
  return <SvgTool />;
}
