import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { ColorTool } from "@/tools/ColorTool";

export const metadata: Metadata = toolMetadata({
  title: "Color Tool",
  description:
    "Convert and inspect colors (HEX, RGB, HSL, OKLCH), generate palettes, and pick accessible combinations.",
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
