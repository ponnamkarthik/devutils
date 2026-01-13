import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { HexTool } from "@/tools/HexTool";

export const metadata: Metadata = toolMetadata({
  title: "Hex Converter",
  description:
    "Convert text to hex (UTF-8) and decode hex back to text. Supports delimiters like spaces, colons, 0x-prefix, and % encoding. Also convert numbers between decimal, hex, binary, and octal (BigInt supported).",
  path: "/hex",
  keywords: [
    "hex converter",
    "text to hex",
    "hex to text",
    "ascii to hex",
    "utf-8 to hex",
    "0x",
    "percent encoding",
    "binary to hex",
    "decimal to hex",
    "hex to decimal",
    "number base converter",
  ],
});

export default function HexPage() {
  return <HexTool />;
}
