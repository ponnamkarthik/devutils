import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UrlTool } from "@/tools/UrlTool";

export const metadata: Metadata = toolMetadata({
  title: "URL Decode",
  description:
    "Decode percent-encoded (URL-encoded) strings back into readable text. Useful for debugging query strings and redirects.",
  path: "/url/decode",
  keywords: [
    "url decode",
    "decode uri",
    "percent decoding",
    "decode url",
    "decode query string",
    "url decoder",
  ],
});

export default function UrlDecodePage() {
  return <UrlTool mode="decoder" />;
}
