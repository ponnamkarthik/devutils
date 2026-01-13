import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CssGridTool } from "@/tools/CssGridTool";

export const metadata: Metadata = toolMetadata({
  title: "CSS Grid Generator",
  description:
    "Visually build CSS Grid layouts by click-dragging grid areas, then export ready-to-use CSS (grid-template + gap + grid-area) and HTML scaffolding.",
  path: "/css-grid",
  keywords: [
    "css grid generator",
    "grid-template-columns",
    "grid-template-rows",
    "grid-area",
    "css layout",
    "grid gap",
    "row gap",
    "column gap",
  ],
});

export default function CssGridPage() {
  return <CssGridTool />;
}
