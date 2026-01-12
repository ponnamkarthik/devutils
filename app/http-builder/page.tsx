import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { HttpRequestBuilderTool } from "@/tools/HttpRequestBuilderTool";

export const metadata: Metadata = toolMetadata({
  title: "HTTP Request Builder",
  description:
    "Build HTTP requests with headers, query params, and body. Generate curl and test API requests.",
  path: "/http-builder",
  keywords: [
    "http request builder",
    "curl generator",
    "curl builder",
    "api request",
    "http client",
    "request headers",
  ],
});

export default function HttpBuilderPage() {
  return <HttpRequestBuilderTool />;
}
