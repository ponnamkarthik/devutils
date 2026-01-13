import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { ColorTool } from "@/tools/ColorTool";

export const metadata: Metadata = toolMetadata({
  title: "Color Tool",
  description:
    "Explore colors in OKLCH with conversions to HEX/RGB/CSS (including display-p3) plus palette generation and WCAG contrast checks.",
  path: "/color",
  keywords: [
    "color converter",
    "hex to rgb",
    "rgb to hex",
    "hsl to hex",
    "oklch",
    "color picker",
    "color palette",
  ],
});

export default function ColorPage() {
  return <ColorTool />;
}
