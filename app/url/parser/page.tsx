import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UrlTool } from "@/tools/UrlTool";

export const metadata: Metadata = toolMetadata({
  title: "URL Parser",
  description:
    "Parse URLs and extract components like protocol, host, pathname, query params, and hash.",
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
