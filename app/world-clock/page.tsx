import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { WorldClockTool } from "@/tools/WorldClockTool";

export const metadata: Metadata = toolMetadata({
  title: "World Clock",
  description:
    "Compare multiple cities/time zones, see offsets and abbreviations, and use a meeting-planner grid to pick overlap-friendly times.",
  path: "/world-clock",
  keywords: [
    "world clock",
    "world time",
    "time zones",
    "timezone converter",
    "utc time",
    "local time",
    "time difference",
  ],
});

export default function WorldClockPage() {
  return <WorldClockTool />;
}
