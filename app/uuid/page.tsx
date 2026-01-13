import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UuidTool } from "@/tools/UuidTool";

export const metadata: Metadata = toolMetadata({
  title: "UUID Generator",
  description:
    "Generate UUIDs in multiple versions (v1, v4, v6, v7, v8, and Nil) with bulk generation and one-click copy.",
  path: "/uuid",
  keywords: [
    "uuid generator",
    "uuid v4",
    "guid",
    "generate uuid",
    "uuid online",
    "uuid tool",
  ],
});

export default function UuidPage() {
  return <UuidTool />;
}
