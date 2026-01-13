import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { TomlJsonTool } from "@/tools/TomlJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON to TOML",
  description:
    "Convert JSON to TOML with parsing/validation, clear error messages, and one-click copy.",
  path: "/toml/toml",
  keywords: ["json to toml", "toml converter", "config converter"],
});

export default function JsonToTomlPage() {
  return <TomlJsonTool mode="json2toml" />;
}
