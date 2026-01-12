import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { YamlJsonTool } from "@/tools/YamlJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON to YAML Converter",
  description:
    "Convert JSON to YAML instantly. Useful for configuration files and infrastructure tooling.",
  path: "/yaml/yaml",
  keywords: [
    "json to yaml",
    "convert json",
    "yaml converter",
    "yaml generator",
    "json to yaml online",
    "convert json to yaml",
  ],
});

export default function JsonToYamlPage() {
  return <YamlJsonTool mode="json2yaml" />;
}
