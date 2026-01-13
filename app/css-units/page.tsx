import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { CssUnitConverterTool } from "@/tools/CssUnitConverterTool";

export const metadata: Metadata = toolMetadata({
  title: "CSS Unit Converter",
  description:
    "Convert CSS units (px, rem, em, %, vw, vh, vmin, vmax, in/cm/mm/pt/pc) with configurable base font size and viewport context.",
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
