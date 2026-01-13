import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { YamlJsonTool } from "@/tools/YamlJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "YAML to JSON Converter",
  description:
    "Convert YAML to JSON with live validation. Handy for config migrations and debugging.",
  path: "/yaml/json",
  keywords: [
    "yaml to json",
    "convert yaml",
    "yaml converter",
    "yaml parser",
    "parse yaml",
    "yaml to json online",
  ],
});

export default function YamlJsonPage() {
  return <YamlJsonTool mode="yaml2json" />;
}
