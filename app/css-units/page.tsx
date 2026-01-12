import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CssUnitConverterTool } from "@/tools/CssUnitConverterTool";

export const metadata: Metadata = toolMetadata({
  title: "CSS Unit Converter",
  description:
    "Convert between CSS units like px, rem, em, %, vw, vh, vmin, vmax with configurable context.",
  path: "/css-units",
  keywords: [
    "css unit converter",
    "px to rem",
    "rem to px",
    "em to px",
    "vw to px",
    "vh to px",
  ],
});

export default function CssUnitsPage() {
  return <CssUnitConverterTool />;
}
