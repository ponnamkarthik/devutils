import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { HttpRequestBuilderTool } from "@/tools/HttpRequestBuilderTool";

export const metadata: Metadata = toolMetadata({
  title: "HTTP Request Builder",
  description:
    "Build and send HTTP requests with query params, headers, auth (Bearer/Basic), and body (JSON, form-data, x-www-form-urlencoded). Generate curl/fetch/axios.",
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
