import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UrlTool } from "@/tools/UrlTool";

export const metadata: Metadata = toolMetadata({
  title: "URL Parser",
  description:
    "Parse and edit URLs: protocol, host, port, path, hash, and query params. Add/remove parameters and rebuild the final URL.",
  path: "/url/parser",
  keywords: [
    "url parser",
    "parse url",
    "url analyzer",
    "query params",
    "querystring parser",
    "url components",
  ],
});

export default function UrlParserPage() {
  return <UrlTool mode="parser" />;
}
