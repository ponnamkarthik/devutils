import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { SqlTool } from "@/tools/SqlTool";

export const metadata: Metadata = toolMetadata({
  title: "SQL Formatter",
  description:
    "Format and prettify SQL queries for readability. Great for debugging and code reviews.",
  path: "/sql",
  keywords: [
    "sql formatter",
    "format sql",
    "sql beautifier",
    "sql pretty print",
    "sql prettify",
    "sql formatter online",
  ],
});

export default function SqlPage() {
  return <SqlTool />;
}
