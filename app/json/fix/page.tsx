import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonTool } from "@/tools/JsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Fixer",
  description:
    "Fix common JSON issues and validate malformed JSON. Make broken JSON parseable again.",
  path: "/json/fix",
  keywords: [
    "json fixer",
    "fix json",
    "json repair",
    "repair json",
    "fix malformed json",
    "json sanitizer",
    "json recovery",
  ],
});

export default function JsonFixPage() {
  return <JsonTool mode="fix" />;
}
