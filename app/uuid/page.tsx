import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { UuidTool } from "@/tools/UuidTool";

export const metadata: Metadata = toolMetadata({
  title: "UUID Generator",
  description:
    "Generate UUIDs (v4) instantly for identifiers in apps, databases, and APIs.",
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
