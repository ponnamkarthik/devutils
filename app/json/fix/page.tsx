import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { JsonTool } from "@/tools/JsonTool";

export const metadata: Metadata = toolMetadata({
  title: "JSON Fixer",
  description:
    "Auto-fix common JSON issues (trailing commas, single quotes, unquoted keys) and reformat into valid, parseable JSON.",
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
