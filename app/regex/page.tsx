import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { RegexTool } from "@/tools/RegexTool";

export const metadata: Metadata = toolMetadata({
  title: "Regex Tester",
  description:
    "Test regular expressions with instant matches and groups. Useful for debugging patterns and replacements.",
  path: "/regex",
  keywords: [
    "regex tester",
    "regular expression",
    "regex",
    "regex playground",
    "regex validator",
    "pattern tester",
    "regex matcher",
  ],
});

export default function RegexPage() {
  return <RegexTool />;
}
