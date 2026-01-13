import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { RegexTool } from "@/tools/RegexTool";

export const metadata: Metadata = toolMetadata({
  title: "Regex Tester",
  description:
    "Test JavaScript regular expressions with flags (g/i/m/s/u/y), match highlighting, groups, and a built-in cheat sheet.",
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
