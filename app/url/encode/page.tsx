import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UrlTool } from "@/tools/UrlTool";

export const metadata: Metadata = toolMetadata({
  title: "URL Encode",
  description:
    "Encode URLs and query parameters safely for use in links and API requests.",
  path: "/url/encode",
  keywords: [
    "url encode",
    "encode uri",
    "percent encoding",
    "encode url",
    "url encoder",
    "encode query string",
  ],
});

export default function UrlEncodePage() {
  return <UrlTool mode="encoder" />;
}
