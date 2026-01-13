import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { TomlJsonTool } from "@/tools/TomlJsonTool";

export const metadata: Metadata = toolMetadata({
  title: "TOML to JSON",
  description:
    "Convert TOML to JSON with parsing/validation, clear error messages, and one-click copy.",
  path: "/toml/json",
  keywords: ["toml to json", "toml converter", "config converter"],
});

export default function TomlToJsonPage() {
  return <TomlJsonTool mode="toml2json" />;
}
