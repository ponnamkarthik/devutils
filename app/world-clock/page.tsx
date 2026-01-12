import type { Metadata } from "next";

import { toolMetadata } from "@/lib/seo";
import { WorldClockTool } from "@/tools/WorldClockTool";

export const metadata: Metadata = toolMetadata({
  title: "World Clock",
  description:
    "Compare time across time zones and cities. Useful for scheduling meetings across regions.",
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
