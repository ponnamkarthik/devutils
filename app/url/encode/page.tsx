import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UrlTool } from "@/tools/UrlTool";

export const metadata: Metadata = toolMetadata({
  title: "URL Encode",
  description:
    "Encode URLs safely using encodeURIComponent or encodeURI. Great for query strings, redirects, and API requests.",
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
