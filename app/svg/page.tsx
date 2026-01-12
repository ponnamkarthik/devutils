import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { SvgTool } from "@/tools/SVGTool";

export const metadata: Metadata = toolMetadata({
  title: "SVG Editor",
  description:
    "View, optimize, edit, and transform SVG code locally in your browser.",
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
